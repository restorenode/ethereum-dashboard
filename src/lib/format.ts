export const fmt = (v: number) => v.toLocaleString("en-US");

export const age = (now: number, ts: number) => {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m`;
};

export const utcClock = (now: number | null) => {
  if (now === null) return "--:--:-- UTC";
  const d = new Date(now);
  const p2 = (v: number) => String(v).padStart(2, "0");
  return `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}:${p2(d.getUTCSeconds())} UTC`;
};

/** "…8977" — the last four digits of a block number, for axis labels. */
export const shortBlock = (n: number) => "…" + String(n).slice(-4);

const FEE_STEPS = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1];

/**
 * Base-fee axis. The tick step adapts to the data (smallest step giving at
 * most five intervals), bounds are padded by 0.3 steps and rounded out to a
 * step, and ticks are thinned to about five labels.
 */
export function feeScale(fees: number[]) {
  const min = Math.min(...fees);
  const max = Math.max(...fees);
  const span = Math.max(max - min, max * 0.02);
  const step = FEE_STEPS.find((s) => span / s <= 5) ?? 1;
  const dec = step < 0.01 ? 3 : 2;
  // Work in whole steps to avoid floating-point drift.
  const loK = Math.max(0, Math.floor((min - 0.3 * step) / step));
  const hiK = Math.ceil((max + 0.3 * step) / step);
  const steps = hiK - loK;
  const every = Math.ceil(steps / 5);
  const ticks: { v: number; label: string }[] = [];
  for (let k = 0; k <= steps; k += every) {
    const v = (hiK - k) * step;
    ticks.push({ v, label: v.toFixed(dec) });
  }
  return { lo: loK * step, hi: hiK * step, ticks };
}
