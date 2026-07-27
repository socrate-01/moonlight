/** Minimal martini-glass icon used as a decorative separator. */
export default function CocktailIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 5h16l-8 8z" />
      <path d="M12 13v6" />
      <path d="M8 19.5h8" />
      <path d="M14.5 7.5 18.5 3.5" />
      <circle cx="18.9" cy="3.1" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
