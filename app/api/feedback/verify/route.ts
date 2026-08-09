import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ATTENDEES_COLLECTION, hashEmail } from "@/lib/attendees";

export const runtime = "nodejs";

/** Vérifie qu'une adresse figure bien parmi les invités autorisés.
 *
 *  La liste blanche `attendees` ne contient que des empreintes SHA-256 : on
 *  peut confirmer une adresse précise, jamais lire ni énumérer les autres.
 *  L'empreinte renvoyée sert d'identifiant du document d'avis — c'est aussi
 *  elle que les règles Firestore vérifient à l'écriture, si bien que la
 *  restriction tient même si quelqu'un contourne cette route. */
export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Adresse manquante." }, { status: 400 });
    }

    const hash = await hashEmail(email);
    const snap = await getDoc(doc(db, ATTENDEES_COLLECTION, hash));

    if (!snap.exists()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Cette adresse ne figure pas dans la liste des invités. Vérifiez la saisie ou utilisez l'adresse indiquée lors de votre inscription.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, hash });
  } catch (err) {
    console.error("feedback verify error", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
