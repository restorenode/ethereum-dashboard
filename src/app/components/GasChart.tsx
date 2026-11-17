import type { BlockRow } from "@/lib/chain";
import { showXLabel } from "@/lib/format";
import Panel from "./Panel";
import styles from "./Charts.module.scss";

type Props = {
  blocks: BlockRow[];
  selected: number | null;
  onSelect: (n: number) => void;
};

const TICKS = [100, 75, 50, 25, 0];

export default function GasChart({ blocks, selected, onSelect }: Props) {
  const legend = (
    <div className={styles.legend}>
      <span className={styles.legendItem}>
        <span className={styles.swatch} style={{ background: "var(--acc)" }} />
        &lt;= TARGET
      </span>
      <span className={styles.legendItem}>
        <span className={styles.swatch} style={{ background: "var(--alt)" }} />
        &gt; TARGET
      </span>
    </div>
  );

  return (
    <Panel index="03" title="GAS USAGE RATIO" unit="%" right={legend}>
      <div className={styles.frame}>
        <div className={styles.plot}>
          {TICKS.map((v, k) => (
            <div key={v} className={styles.tick} style={{ top: `${k * 25}%` }}>
              <span className={styles.tickLabel} style={v === 50 ? { color: "var(--alt)" } : undefined}>
                {v === 50 ? "50 TGT" : v}
              </span>
            </div>
          ))}

          {blocks.length === 0 && <div className={styles.empty}>no data yet</div>}

          <div className={styles.bars}>
            {blocks.map((b, i) => {
              const c = b.gas > 50 ? "var(--alt)" : "var(--acc)";
              const op = selected !== null && selected !== b.n ? 0.25 : 1;
              const h = Math.min(100, b.gas);
              // Keep the value label clear of the dashed target line.
              const labelBottom = Math.abs(b.gas - 50) < 6 ? 54 : h;
              return (
                <button
                  key={b.n}
                  type="button"
                  className={styles.barCol}
                  onClick={() => onSelect(b.n)}
                  aria-label={`Block ${b.n}, gas used ${b.gas.toFixed(1)}%`}
                  aria-pressed={selected === b.n}
                >
                  <span className={styles.barVal} style={{ bottom: `${labelBottom}%`, color: c, opacity: op }}>
                    {b.gas.toFixed(1)}
                  </span>
                  <div className={styles.bar} style={{ height: `${h}%`, background: c, opacity: op }} />
                  {showXLabel(i, blocks.length, selected === b.n, selected !== null) && (
                    <span className={styles.barLabel} style={{ color: selected === b.n ? "var(--acc)" : "#555" }}>
                      {b.n}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className={styles.targetLine} />
        </div>
      </div>
    </Panel>
  );
}
