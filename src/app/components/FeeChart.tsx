import type { BlockRow } from "@/lib/chain";
import { feeScale, showXLabel } from "@/lib/format";
import Panel from "./Panel";
import styles from "./Charts.module.scss";

type Props = {
  blocks: BlockRow[];
  selected: number | null;
  onSelect: (n: number) => void;
};

export default function FeeChart({ blocks, selected, onSelect }: Props) {
  const n = blocks.length;
  const selB = blocks.find((b) => b.n === selected);
  const readout = selB ?? blocks[n - 1];

  const right = readout ? (
    <span className={styles.readout}>
      #{readout.n} <span className={styles.acc}>{readout.fee.toFixed(3)}</span>
    </span>
  ) : null;

  if (n === 0) {
    return (
      <Panel index="02" title="BASE FEE / BLOCK" unit="GWEI">
        <div className={styles.frame}>
          <div className={styles.empty}>no data yet</div>
        </div>
      </Panel>
    );
  }

  const { lo, hi, ticks } = feeScale(blocks.map((b) => b.fee));
  const x = (i: number) => ((i + 0.5) / n) * 100;
  const y = (v: number) => ((hi - v) / (hi - lo)) * 100;

  const line = "M" + blocks.map((b, i) => `${x(i).toFixed(2)},${y(b.fee).toFixed(2)}`).join(" L");
  const area = `${line} L${x(n - 1)},100 L${x(0)},100 Z`;

  return (
    <Panel index="02" title="BASE FEE / BLOCK" unit="GWEI" right={right}>
      <div className={styles.frame}>
        <div className={styles.plot}>
          {ticks.map((t) => (
            <div key={t.label} className={styles.tick} style={{ top: `${y(t.v)}%` }}>
              <span className={styles.tickLabel}>{t.label}</span>
            </div>
          ))}

          <svg className={styles.svg} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <path d={area} fill="var(--acc)" fillOpacity={0.06} stroke="none" />
            <path
              d={line}
              fill="none"
              stroke="var(--acc)"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
          </svg>

          {selB && <div className={styles.selLine} style={{ left: `${x(blocks.indexOf(selB))}%` }} />}

          {blocks.map((b, i) => {
            const isSel = selected === b.n;
            const size = isSel ? 11 : 7;
            return (
              <div key={b.n}>
                <button
                  type="button"
                  className={styles.point}
                  aria-label={`Block ${b.n}, base fee ${b.fee.toFixed(3)} gwei`}
                  aria-pressed={isSel}
                  onClick={() => onSelect(b.n)}
                  style={{
                    left: `${x(i)}%`,
                    top: `${y(b.fee)}%`,
                    width: size,
                    height: size,
                    background: isSel ? "var(--acc)" : "var(--panel)",
                  }}
                />
                {showXLabel(i, n, isSel, selected !== null) && (
                  <span className={styles.xLabel} style={{ left: `${x(i)}%`, color: isSel ? "var(--acc)" : undefined }}>
                    {b.n}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
