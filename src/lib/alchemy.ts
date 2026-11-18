import { Alchemy, Network } from "alchemy-sdk";

const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

/**
 * Set when NEXT_PUBLIC_ALCHEMY_API_KEY is missing. Without a key the SDK
 * silently falls back to Alchemy's heavily rate-limited "demo" key, so we
 * show this instead of fetching.
 */
export const missingKeyError = apiKey
  ? null
  : "missing NEXT_PUBLIC_ALCHEMY_API_KEY: add it to .env.local and restart the dev server";

const alchemy = new Alchemy({ apiKey, network: Network.ETH_MAINNET });

export default alchemy;
