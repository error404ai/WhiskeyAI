import { Connection, PublicKey } from "@solana/web3.js";

export class RpcService {
  private rpcEndpoint = "https://docs-demo.solana-mainnet.quiknode.pro/f7099dfbb4f97b846ab3139096124952f9a37b34/";
  async getAccountInfo(publickey: string) {
    const publicKey = new PublicKey(publickey);
    const solana = new Connection(this.rpcEndpoint);
    const accountInfo = await solana.getAccountInfo(publicKey);
    return accountInfo;
  }

  async getBalance(publickey: string) {
    const publicKey = new PublicKey(publickey);
    const solana = new Connection(this.rpcEndpoint);
    const balance = await solana.getBalance(publicKey);
    return balance;
  }
  async getBlock(slot: number) {
    const solana = new Connection(this.rpcEndpoint);
    const block = solana.getBlock(slot, { maxSupportedTransactionVersion: 0 });
    return block;
  }
}

const rpcService = new RpcService();
export default rpcService;
