import { useState } from "react";
import type { BlockRow, TokenStatus } from "@/lib/chain";
import { fmt } from "@/lib/format";
import Panel from "./Panel";
import styles from "./TransferVolume.module.scss";

const EXAMPLE = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

type Props = {
  blocks: BlockRow[];
  selected: number | null;
  token: string | null;
  counts: Record<number, number>;
  status: TokenStatus;
  error: string | null;
  onRun: (token: string | null) => void;
};

export default function TransferVolume({ blocks, selected, token, counts, status, error, onRun }: Props) {
  const [input, setInput] = useState("");
  const [invalid, setInvalid] = useState(false);

  const run = (value = input) => {
    const t = value.trim();
    if (t === "") {
      setInvalid(false);
      onRun(null);
    } else if (!ADDRESS_RE.test(t)) {
      setInvalid(true);
      onRun(null);
    } else {
      setInvalid(false);
      onRun(t);
    }
  };

  const shown: "idle" | "invalid" | TokenStatus = invalid ? "invalid" : token ? status : "idle";
  const label = { idle: "IDLE", invalid: "ERROR", loading: "SCANNING", ok: "OK", error: "ERROR" }[shown];
  const labelColor =
    shown === "ok" ? "var(--acc)" : shown === "invalid" || shown === "error" ? "var(--alt)" : "var(--muted)";

  const rows = [...blocks].reverse().map((b) => ({ n: b.n, v: counts[b.n] ?? 0 }));
  const max = Math.max(1, ...rows.map((r) => r.v));
  const total = rows.reduce((a, r) => a + r.v, 0);

  return (
    <Panel index="04" title="ERC20 TRANSFER VOLUME" right={<span style={{ color: labelColor }}>{label}</span>}>
      <div className={styles.body}>
        <form
          className={styles.cmd}
          onSubmit={(e) => {
            e.preventDefault();
            run();
          }}
        >
          <label htmlFor="token" className={styles.prompt}>
            $ token&nbsp;
          </label>
          <input
            id="token"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (e.target.value.trim() === "") {
                setInvalid(false);
                onRun(null);
              }
            }}
            placeholder="0x… paste ERC20 contract address"
            spellCheck={false}
            autoComplete="off"
            className={styles.input}
          />
          <button type="submit" className={styles.run}>
            RUN ↵
          </button>
        </form>

        <div className={styles.results}>
          {shown === "idle" && (
            <div className={styles.message}>
              <div>
                <span className={styles.acc}>&gt;</span> awaiting token address
              </div>
              <div>usage: erc20 volume --token &lt;0x + 40 hex&gt; --blocks {blocks.length}</div>
              <div>
                <a
                  href="#"
                  className={styles.example}
                  onClick={(e) => {
                    e.preventDefault();
                    setInput(EXAMPLE);
                    run(EXAMPLE);
                  }}
                >
                  load example: USDC
                </a>
              </div>
            </div>
          )}

          {shown === "invalid" && (
            <div className={styles.message}>
              <div className={styles.alt}>ERR invalid address</div>
              <div className={styles.muted}>expected 0x followed by 40 hexadecimal characters</div>
            </div>
          )}

          {shown === "error" && (
            <div className={styles.message}>
              <div className={styles.alt}>ERR log query failed</div>
              <div className={styles.muted}>{error}</div>
            </div>
          )}

          {shown === "loading" && (
            <div className={styles.message}>
              <div>
                <span className={styles.acc}>&gt;</span> scanning Transfer logs in blocks {blocks[0]?.n}–
                {blocks[blocks.length - 1]?.n}…
              </div>
            </div>
          )}

          {shown === "ok" && token && (
            <div className={styles.result}>
              <div className={styles.resultHead}>
                <span>
                  {token.slice(0, 6)}…{token.slice(-4)}
                </span>
                <span>TRANSFERS</span>
              </div>
              <div className={styles.list}>
                {rows.map((r) => (
                  <div key={r.n} className={styles.volRow}>
                    <span className={styles.volLabel}>#{r.n}</span>
                    <div className={styles.track}>
                      <div
                        className={styles.fill}
                        style={{ width: `${(r.v / max) * 100}%`, opacity: selected !== null && selected !== r.n ? 0.3 : 1 }}
                      />
                    </div>
                    <span className={styles.volVal}>{fmt(r.v)}</span>
                  </div>
                ))}
              </div>
              <div className={styles.total}>
                <span className={styles.muted}>total</span>
                <span className={styles.acc}>{fmt(total)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
