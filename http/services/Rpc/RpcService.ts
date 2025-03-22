import { Connection, PublicKey } from "@solana/web3.js";

export class RpcService {
  private rpcEndpoint = "https://docs-demo.solana-mainnet.quiknode.pro/f7099dfbb4f97b846ab3139096124952f9a37b34/";
  async getAccountInfo(publickey: string) {
    const publicKey = new PublicKey(publickey);
    const solana = new Connection(this.rpcEndpoint);
    const accountInfo = await solana.getAccountInfo(publicKey);
    return accountInfo;
  }
}

const rpcService = new RpcService();
export default rpcService;
