/** Fixed animated backdrop — drifting glow orbs, theme-aware. */
export default function Ambient() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg">
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg to-surface" />
      <div className="absolute -right-40 -top-52 h-[46rem] w-[46rem] rounded-full bg-gold/10 blur-[150px] animate-drift" />
      <div
        className="absolute -bottom-56 -left-40 h-[44rem] w-[44rem] rounded-full bg-accent/15 blur-[150px] animate-drift"
        style={{ animationDelay: "-8s" }}
      />
      <div
        className="absolute left-1/2 top-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-indigo-plum/10 blur-[140px] animate-drift"
        style={{ animationDelay: "-16s" }}
      />
      {/* vignette */}
      <div className="absolute inset-0 [background:radial-gradient(120%_90%_at_50%_15%,transparent_55%,rgb(var(--bg)/0.6))]" />
    </div>
  );
}
