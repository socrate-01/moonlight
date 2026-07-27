/** Decorative placeholder QR — deterministic pattern from a seed string.
 *  (Real QR generation will be wired to the backend later.) */
export default function FauxQR({
  seed = "moonlight",
  className = "",
}: {
  seed?: string;
  className?: string;
}) {
  const n = 21;

  // Finder-pattern squares in three corners (top-left, top-right, bottom-left).
  const finderOrigins: [number, number][] = [
    [0, 0],
    [0, n - 7],
    [n - 7, 0],
  ];

  const finderCell = (r: number, c: number): boolean | null => {
    for (const [br, bc] of finderOrigins) {
      if (r >= br && r < br + 7 && c >= bc && c < bc + 7) {
        const lr = r - br;
        const lc = c - bc;
        const ring = lr === 0 || lr === 6 || lc === 0 || lc === 6;
        const core = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
        return ring || core;
      }
    }
    return null;
  };

  // Simple deterministic PRNG seeded from the string.
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h = (h ^ seed.charCodeAt(i)) >>> 0;
    h = (h * 16777619) >>> 0;
  }
  const rand = (r: number, c: number) => {
    let x = (h ^ (r * 73856093) ^ (c * 19349663)) >>> 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) & 1) === 1;
  };

  const rects: JSX.Element[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const f = finderCell(r, c);
      const filled = f === null ? rand(r, c) : f;
      if (filled) {
        rects.push(
          <rect key={`${r}-${c}`} x={c} y={r} width={1.02} height={1.02} fill="currentColor" />
        );
      }
    }
  }

  return (
    <svg viewBox={`0 0 ${n} ${n}`} className={className} shapeRendering="crispEdges">
      {rects}
    </svg>
  );
}
