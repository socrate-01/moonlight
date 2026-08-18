/** Paiement de l'acompte via Square.
 *
 *  On appelle l'API REST directement plutôt que par le SDK : deux points de
 *  contact suffisent (créer un lien de paiement, relire une commande), et le
 *  SDK aurait pesé bien plus lourd que ces quelques lignes. */

const API_VERSION = process.env.SQUARE_API_VERSION || "2025-01-23";

/** L'environnement est explicite : une clé de production envoyée au bac à
 *  sable — ou l'inverse — échoue avec un message peu parlant. */
function baseUrl() {
  const env = (process.env.SQUARE_ENVIRONMENT || "sandbox").toLowerCase();
  return env === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

export function squareConfigured() {
  return Boolean(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID);
}

async function squareFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      "Square-Version": API_VERSION,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail =
      (body as { errors?: { detail?: string }[] }).errors?.[0]?.detail ??
      `HTTP ${res.status}`;
    throw new Error(`Square : ${detail}`);
  }
  return body as Record<string, unknown>;
}

export type PaymentLink = { url: string; orderId: string; paymentLinkId: string };

/** Crée un lien de paiement hébergé pour l'acompte.
 *
 *  Le jeton de la proposition est posé en `reference_id` de la commande : le
 *  webhook n'a que l'identifiant de commande, et c'est par cette référence
 *  qu'il retrouve la réservation à marquer payée. */
export async function createDepositLink(params: {
  token: string;
  amount: number;
  currency: string;
  description: string;
  buyerEmail?: string;
  redirectUrl: string;
}): Promise<PaymentLink> {
  const cents = Math.round(params.amount * 100);
  if (!Number.isFinite(cents) || cents <= 0) {
    throw new Error("Montant d'acompte invalide.");
  }

  const body = await squareFetch("/v2/online-checkout/payment-links", {
    method: "POST",
    body: JSON.stringify({
      // Rejouer la même confirmation ne crée pas un second lien.
      idempotency_key: `deposit-${params.token}`.slice(0, 45),
      order: {
        location_id: process.env.SQUARE_LOCATION_ID,
        reference_id: params.token,
        line_items: [
          {
            name: params.description,
            quantity: "1",
            base_price_money: {
              amount: cents,
              currency: params.currency,
            },
          },
        ],
      },
      checkout_options: {
        redirect_url: params.redirectUrl,
        ask_for_shipping_address: false,
      },
      ...(params.buyerEmail
        ? { pre_populated_data: { buyer_email: params.buyerEmail } }
        : {}),
    }),
  });

  const link = body.payment_link as
    | { url?: string; order_id?: string; id?: string }
    | undefined;

  if (!link?.url) throw new Error("Square n'a pas renvoyé de lien de paiement.");

  return {
    url: link.url,
    orderId: link.order_id ?? "",
    paymentLinkId: link.id ?? "",
  };
}

/** Relit une commande pour récupérer sa référence — c'est-à-dire le jeton de
 *  la proposition — et son état de règlement. */
export async function getOrder(orderId: string) {
  const body = await squareFetch(`/v2/orders/${encodeURIComponent(orderId)}`);
  const order = body.order as
    | { reference_id?: string; state?: string; total_money?: { amount?: number } }
    | undefined;
  return {
    referenceId: order?.reference_id ?? "",
    state: order?.state ?? "",
    total: (order?.total_money?.amount ?? 0) / 100,
  };
}
