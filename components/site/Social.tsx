import { SOCIALS } from "@/lib/site";

/** Glyphes tracés à la main : aucune librairie d'icônes à charger, et le
 *  rendu reste net à toutes les tailles. */
const PATHS: Record<string, JSX.Element> = {
  instagram: (
    <>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.4" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  tiktok: (
    <path d="M14.2 3v9.9a3.3 3.3 0 1 1-2.9-3.3M14.2 3c.3 2.2 2 3.9 4.2 4.1M14.2 3h.1" />
  ),
  facebook: (
    <path d="M14.6 8.4V6.8c0-.8.2-1.2 1.3-1.2h1.4V2.9c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2H9.2v3h2.5V21h3v-9.6h2.5l.4-3z" />
  ),
  snapchat: (
    <path d="M12 3c2.6 0 4.2 1.9 4.2 4.4 0 .8-.1 1.6-.1 2 .3.2.8.2 1.2 0 .6-.2 1.1.5.6 1-.4.4-1.3.7-1.5 1.1-.2.5.9 2.6 3 3.3.4.1.4.6 0 .8-.6.3-1.6.4-1.9.7-.2.2-.1.9-.5 1-.4.2-1.4-.2-2.4 0-.9.2-1.6 1.4-2.6 1.4s-1.7-1.2-2.6-1.4c-1-.2-2 .2-2.4 0-.4-.1-.3-.8-.5-1-.3-.3-1.3-.4-1.9-.7-.4-.2-.4-.7 0-.8 2.1-.7 3.2-2.8 3-3.3-.2-.4-1.1-.7-1.5-1.1-.5-.5 0-1.2.6-1 .4.2.9.2 1.2 0 0-.4-.1-1.2-.1-2C7.8 4.9 9.4 3 12 3z" />
  ),
};

export default function Social({
  className = "",
  size = 18,
  tone = "muted",
}: {
  className?: string;
  size?: number;
  tone?: "muted" | "light";
}) {
  return (
    <ul className={`flex items-center gap-3 ${className}`}>
      {SOCIALS.map((s) => (
        <li key={s.key}>
          <a
            href={s.href}
            target={s.href === "#" ? undefined : "_blank"}
            rel="noreferrer noopener"
            aria-label={s.label}
            title={s.label}
            className={`group flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-500 hover:-translate-y-1 ${
              tone === "light"
                ? "border-white/25 text-white/70 hover:border-white hover:text-white"
                : "border-fg/15 text-muted hover:border-gold hover:text-gold"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              width={size}
              height={size}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-500 group-hover:scale-110"
            >
              {PATHS[s.key]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
