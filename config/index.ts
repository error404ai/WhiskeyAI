

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

export const SOLANA_CONFIG = {
  RPC_ENDPOINT: "https://kelcey-184ipf-fast-mainnet.helius-rpc.com",

  NETWORK: WalletAdapterNetwork.Mainnet,
  
  RECIPIENT_WALLET: "ASzaZmbQoNCAyvi7PKQauAiKvHosEXkoXyWCj2UzvtFp",
};


export const PAYMENT_CONFIG = {
  AGENT_CREATION_FEE: 0.0001,
  
  MINIMUM_RENT_EXEMPT_BALANCE: 0.00203928,
  
  TRANSACTION_FEE_BUFFER: 0.001,
  
  MAX_TRANSACTION_AGE_MS: 24 * 60 * 60 * 1000, // 24 hours
  
  MAX_AGENTS_PER_USER: 50,
};


export const API_CONFIG = {
  PUMP_FUN_API: "https://pump.fun/api",
  
  PUMP_PORTAL_API: "https://pumpportal.fun/api",
  
  TOKEN_CREATION_PRIORITY_FEE: 0.0005,
};

export const SOCIAL_CONFIG = {
  PUMP_FUN_COIN_URL: "https://pump.fun/coin/",
  
  SOLSCAN_TX_URL: "https://solscan.io/tx/",
};


const config ={
    SOLANA: SOLANA_CONFIG,
    PAYMENT: PAYMENT_CONFIG,
    API: API_CONFIG,
    SOCIAL: SOCIAL_CONFIG,
  }

export default config;