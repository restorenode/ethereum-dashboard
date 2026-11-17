import type { BlockRow } from "@/lib/chain";
import { age, fmt } from "@/lib/format";
import Panel from "./Panel";
import styles from "./RecentBlocks.module.scss";

type Props = {
  blocks: BlockRow[];
  now: number | null;
  selected: number | null;
  error: string | null;
  windowMax: number;
  onSelect: (n: number) => void;
};

export default function RecentBlocks({ blocks, now, selected, error, windowMax, onSelect }: Props) {
  const maxTx = Math.max(1, ...blocks.map((b) => b.txs));
  const newest = blocks[blocks.length - 1]?.n;

  return (
    <Panel index="01" title="RECENT BLOCKS" right={<span>{`${blocks.length} / ${windowMax}`}</span>}>
      <div className={`${styles.row} ${styles.headRow}`}>
        <span>BLOCK</span>
        <span>TXS</span>
        <span>GAS USED</span>
        <span className={styles.right}>FEE</span>
        <span className={styles.right}>AGE</span>
      </div>

      <div className={styles.scroll}>
        {blocks.length === 0 && (
          <div className={styles.empty}>
            {error ? (
              <span className={styles.err}>ERR {error}</span>
            ) : (
              <>
                <span className={styles.acc}>&gt;</span> fetching latest blocks…
              </>
            )}
          </div>
        )}

        {[...blocks].reverse().map((b) => {
          const isSel = selected === b.n;
          const over = b.gas > 50;
          return (
            <button
              key={b.n}
              type="button"
              className={`${styles.row} ${styles.block} ${isSel ? styles.selected : ""}`}
              onClick={() => onSelect(b.n)}
              aria-pressed={isSel}
            >
              <span className={isSel || b.n === newest ? styles.acc : styles.id}>#{b.n}</span>
              <div className={styles.txCell}>
                <span>{fmt(b.txs)}</span>
                <div className={styles.txTrack}>
                  <div className={styles.txBar} style={{ width: `${(b.txs / maxTx) * 100}%` }} />
                </div>
              </div>
              <div className={styles.gasCell}>
                <div className={styles.gasTrack}>
                  <div className={styles.target} />
                  <div
                    className={styles.gasBar}
                    style={{ width: `${Math.min(100, b.gas)}%`, background: over ? "var(--alt)" : "var(--acc)" }}
                  />
                </div>
                <span className={styles.gasVal} style={{ color: over ? "var(--alt)" : "var(--acc)" }}>
                  {b.gas.toFixed(1)}%
                </span>
              </div>
              <span className={`${styles.right} ${styles.val}`}>{b.fee.toFixed(3)}</span>
              <span className={`${styles.right} ${styles.muted}`}>{age(now ?? b.ts, b.ts)}</span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
