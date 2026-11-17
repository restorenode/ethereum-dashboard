"use client";

import { useState } from "react";
import { useBlocks, useNow, useTransferCounts, WINDOW } from "@/lib/chain";
import { age, fmt, utcClock } from "@/lib/format";
import RecentBlocks from "@/app/components/RecentBlocks";
import FeeChart from "@/app/components/FeeChart";
import GasChart from "@/app/components/GasChart";
import TransferVolume from "@/app/components/TransferVolume";
import styles from "./Dashboard.module.scss";

const BLOCK_TIME_S = 12;

export default function Home() {
  const [live, setLive] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const now = useNow();
  const { blocks, error } = useBlocks(live);
  const transfers = useTransferCounts(token, blocks);

  const select = (n: number) => setSelected((s) => (s === n ? null : n));
  // A selected block that has scrolled out of the window no longer counts.
  const sel = blocks.some((b) => b.n === selected) ? selected : null;

  const n = blocks.length;
  const last = blocks[n - 1];
  const prev = blocks[n - 2];
  const dFee = last && prev && prev.fee > 0 ? ((last.fee - prev.fee) / prev.fee) * 100 : null;
  const totTx = blocks.reduce((a, b) => a + b.txs, 0);
  const avgGas = n ? blocks.reduce((a, b) => a + b.gas, 0) / n : null;
  const nextIn = live && last && now !== null ? Math.max(0, BLOCK_TIME_S - Math.floor((now - last.ts) / 1000)) : null;
  const feeWord = dFee === null ? "" : dFee > 0 ? "fees rising" : dFee < 0 ? "fees falling" : "unchanged";

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.crumbs}>
          <span className={styles.logo} />
          <span className={styles.brand}>eth.insights</span>
          <span>/</span>
          <span>mainnet</span>
          <span>/</span>
          <span>overview</span>
        </div>
        <div className={styles.status}>
          <button className={styles.liveBtn} onClick={() => setLive((l) => !l)} aria-pressed={!live}>
            <span className={live ? styles.dotLive : styles.dotPaused} />
            <span>{live ? "LIVE" : "PAUSED"}</span>
          </button>
          <span className={styles.nowrap}>
            blk <span className={styles.hi}>{last ? last.n : "—"}</span>
          </span>
          <span className={`${styles.hi} ${styles.nowrap}`}>{utcClock(now)}</span>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <div>
            <div className={styles.prompt}>
              ~/ethereum <span className={styles.acc}>$</span> ./insights --watch --interval={BLOCK_TIME_S}s
            </div>
            <h1 className={styles.title}>
              Ethereum Insights
              <span className={styles.cursor} />
            </h1>
          </div>
          <div className={styles.meta}>
            <div>CHAIN_ID 1 · EIP-1559</div>
            <div>CLICK A BLOCK TO INSPECT</div>
          </div>
        </div>

        <section className={styles.kpis}>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>BLOCK HEIGHT</div>
            <div className={styles.kpiValue}>{last ? fmt(last.n) : "—"}</div>
            <div className={styles.kpiSub}>{last ? `mined ${age(now ?? last.ts, last.ts)} ago` : "waiting for data"}</div>
          </div>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>BASE FEE</div>
            <div className={styles.kpiValue}>
              {last ? last.fee.toFixed(3) : "—"} <span className={styles.kpiUnit}>gwei</span>
            </div>
            <div className={styles.kpiSub}>
              {dFee === null ? (
                "—"
              ) : (
                <>
                  <span style={{ color: dFee > 0 ? "var(--alt)" : "var(--acc)" }}>
                    {dFee >= 0 ? "▲ +" : "▼ "}
                    {dFee.toFixed(2)}%
                  </span>{" "}
                  {feeWord}
                </>
              )}
            </div>
          </div>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>AVG GAS USED</div>
            <div className={styles.kpiValue}>
              {avgGas === null ? "—" : avgGas.toFixed(1)}
              <span className={styles.kpiUnit}>%</span>
            </div>
            <div className={styles.kpiSub}>target 50.0%</div>
          </div>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>TRANSACTIONS</div>
            <div className={styles.kpiValue}>{n ? fmt(totTx) : "—"}</div>
            <div className={styles.kpiSub}>
              last {n} blocks · {n ? fmt(Math.round(totTx / n)) : 0}/blk
            </div>
          </div>
        </section>

        <section className={styles.grid}>
          <RecentBlocks
            blocks={blocks}
            now={now}
            selected={sel}
            error={error}
            windowMax={WINDOW}
            onSelect={select}
          />
          <FeeChart blocks={blocks} selected={sel} onSelect={select} />
          <GasChart blocks={blocks} selected={sel} onSelect={select} />
          <TransferVolume blocks={blocks} selected={sel} token={token} onRun={setToken} {...transfers} />
        </section>

        <footer className={styles.footer}>
          <span>source: mainnet rpc · eth_getBlockByNumber · eth_getLogs</span>
          <span className={styles.nowrap}>next block in {nextIn ?? "—"}s</span>
        </footer>
      </main>

      <div className={styles.scanlines} aria-hidden />
    </div>
  );
}
