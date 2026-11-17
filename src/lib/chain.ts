"use client";

import { useEffect, useState } from "react";
import type { Block } from "alchemy-sdk";
import { id } from "ethers";
import alchemy from "@/lib/alchemy";

/** Most blocks kept on screen; the window grows to this as new blocks arrive. */
export const WINDOW = 10;
/** Blocks fetched when the page loads (or resumes after a pause). */
const INITIAL = 5;

const TRANSFER_TOPIC = id("Transfer(address,address,uint256)");

export type BlockRow = {
  n: number;
  txs: number;
  /** base fee in gwei */
  fee: number;
  /** gas used as % of gas limit */
  gas: number;
  /** block timestamp, ms */
  ts: number;
};

const toRow = (b: Block): BlockRow => {
  const limit = Number(b.gasLimit.toString());
  return {
    n: b.number,
    txs: b.transactions.length,
    fee: b.baseFeePerGas ? Number(b.baseFeePerGas.toString()) / 1e9 : 0,
    gas: limit > 0 ? (Number(b.gasUsed.toString()) / limit) * 100 : 0,
    ts: b.timestamp * 1000,
  };
};

const merge = (prev: BlockRow[], next: BlockRow[]): BlockRow[] => {
  const byNum = new Map(prev.map((b) => [b.n, b]));
  for (const b of next) byNum.set(b.n, b);
  return [...byNum.values()].sort((a, b) => a.n - b.n).slice(-WINDOW);
};

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

/**
 * Recent mainnet blocks, oldest first. While `live`, new blocks are appended
 * as they're mined; when paused, the window freezes.
 */
export function useBlocks(live: boolean) {
  const [blocks, setBlocks] = useState<BlockRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!live) return;
    let cancelled = false;

    const load = async () => {
      try {
        const latest = await alchemy.core.getBlockNumber();
        const res = await Promise.all(
          Array.from({ length: INITIAL }, (_, i) => alchemy.core.getBlock(latest - (INITIAL - 1 - i))),
        );
        if (cancelled) return;
        const rows = res.filter(Boolean).map(toRow);
        setBlocks((prev) => {
          // After a long pause the old window no longer connects to the new
          // blocks; start over rather than show a gap.
          const contiguous = prev.length > 0 && rows.length > 0 && prev[prev.length - 1].n >= rows[0].n - 1;
          return contiguous ? merge(prev, rows) : merge([], rows);
        });
        setError(null);
      } catch (e) {
        if (!cancelled) setError(errorText(e));
      }
    };

    const onBlock = async (num: number) => {
      try {
        const b = await alchemy.core.getBlock(num);
        if (cancelled || !b) return;
        setBlocks((prev) => merge(prev, [toRow(b)]));
        setError(null);
      } catch (e) {
        if (!cancelled) setError(errorText(e));
      }
    };

    load();
    alchemy.ws.on("block", onBlock);
    return () => {
      cancelled = true;
      alchemy.ws.off("block", onBlock);
    };
  }, [live]);

  return { blocks, error };
}

export type TokenStatus = "idle" | "loading" | "ok" | "error";

/**
 * Number of ERC20 Transfer events emitted by `token` in each block of the
 * window, keyed by block number. Refreshes as the window moves.
 */
export function useTransferCounts(token: string | null, blocks: BlockRow[]) {
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [status, setStatus] = useState<TokenStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const from = blocks[0]?.n;
  const to = blocks[blocks.length - 1]?.n;

  // A new token starts from a clean slate; window moves keep showing the old
  // counts until the refresh lands.
  useEffect(() => {
    setCounts({});
    setError(null);
    setStatus(token ? "loading" : "idle");
  }, [token]);

  useEffect(() => {
    if (!token || from === undefined || to === undefined) return;
    let cancelled = false;

    alchemy.core
      .getLogs({ fromBlock: from, toBlock: to, address: token, topics: [TRANSFER_TOPIC] })
      .then((logs) => {
        if (cancelled) return;
        const next: Record<number, number> = {};
        for (const log of logs) next[log.blockNumber] = (next[log.blockNumber] ?? 0) + 1;
        setCounts(next);
        setStatus("ok");
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setStatus("error");
        setError(errorText(e));
      });

    return () => {
      cancelled = true;
    };
  }, [token, from, to]);

  return { counts, status, error };
}

/**
 * Ticks once a second; drives ages, the UTC clock and the next-block countdown.
 * `null` until mounted, so the server render and the first client render
 * match (reading the clock during render causes a hydration mismatch).
 */
export function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);
  return now;
}
