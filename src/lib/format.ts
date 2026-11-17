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

/**
 * Which x-axis labels to show: every other block counting back from the
 * latest (so the latest is always labeled), or only the selected block.
 */
export const showXLabel = (i: number, count: number, isSelected: boolean, anySelected: boolean) =>
  anySelected ? isSelected : (count - 1 - i) % 2 === 0;

const FEE_STEP = 0.05;

/**
 * Base-fee axis: bounds padded by 0.01 and rounded out to 0.05, ticks on
 * clean 0.05 steps thinned to about five labels.
 */
export function feeScale(fees: number[]) {
  // Work in whole 0.05 steps to avoid floating-point drift.
  const loK = Math.max(0, Math.floor((Math.min(...fees) - 0.01) / FEE_STEP));
  const hiK = Math.ceil((Math.max(...fees) + 0.01) / FEE_STEP);
  const steps = hiK - loK;
  const every = Math.ceil(steps / 5);
  const ticks: { v: number; label: string }[] = [];
  for (let k = 0; k <= steps; k += every) {
    const v = (hiK - k) * FEE_STEP;
    ticks.push({ v, label: v.toFixed(2) });
  }
  return { lo: loK * FEE_STEP, hi: hiK * FEE_STEP, ticks };
}
