import { Web3 } from "web3";
import { bytesToHex } from "@ethereumjs/util";
import { FeeMarketEIP1559Transaction } from "@ethereumjs/tx";
import {
  deriveChildPublicKey,
  najPublicKeyStrToUncompressedHexPoint,
  uncompressedHexPointToEvmAddress,
} from "./kdf";
import { Common } from "@ethereumjs/common";

export class Ethereum {
  web3: Web3;
  chainId: number;

  constructor(chain_rpc: any, chainId: number) {
    this.web3 = new Web3(chain_rpc);
    this.chainId = chainId;
    this.queryGasPrice();
  }

  async deriveAddress(accountId: string, derivationPath: string) {
    const publicKey = await deriveChildPublicKey(
      najPublicKeyStrToUncompressedHexPoint(),
      accountId,
      derivationPath
    );
    const address = await uncompressedHexPointToEvmAddress(publicKey);
    return { publicKey: Buffer.from(publicKey, "hex"), address };
  }

  async queryGasPrice() {
    const maxFeePerGas = await this.web3.eth.getGasPrice();
    const maxPriorityFeePerGas = await this.web3.eth.getMaxPriorityFeePerGas();
    return { maxFeePerGas, maxPriorityFeePerGas };
  }

  async getBalance(accountId: string) {
    const balance = await this.web3.eth.getBalance(accountId);
    const ONE_ETH = 1000000000000000000n;
    return Number((balance * 100n) / ONE_ETH) / 100;
  }

  async createPayload(
    sender: string,
    receiver: string,
    amount: number,
    data: string
  ) {
    const common = new Common({ chain: this.chainId });

    // Get the nonce & gas price
    const nonce = await this.web3.eth.getTransactionCount(sender);
    const { maxFeePerGas, maxPriorityFeePerGas } = await this.queryGasPrice();

    // Construct transaction
    const transactionData = {
      nonce,
      gasLimit: 21000,
      maxFeePerGas,
      maxPriorityFeePerGas,
      to: receiver,
      value: BigInt(this.web3.utils.toWei(amount, "ether")),
      chain: this.chainId,
      data,
    };

    // Return the message hash
    const transaction = FeeMarketEIP1559Transaction.fromTxData(
      transactionData,
      { common }
    );
    const payload = transaction.getHashedMessageToSign();
    return { transaction, payload };
  }

  async requestSignatureToMPC(
    wallet: any,
    contractId: string,
    path: string,
    ethPayload: any,
    transaction: FeeMarketEIP1559Transaction,
    sender: string
  ) {
    // Ask the MPC to sign the payload
    const payload = Array.from(ethPayload.reverse());
    const request = await wallet.callMethod({
      contractId,
      method: "sign",
      args: { payload, path, key_version: 0 },
      gas: "250000000000000",
    });
    const [big_r, big_s] = await wallet.getTransactionResult(
      request.transaction.hash
    );

    // reconstruct the signature
    const r = Buffer.from(big_r.substring(2), "hex");
    const s = Buffer.from(big_s, "hex");

    const candidates = [0n, 1n].map((v) => transaction.addSignature(v, r, s));
    const signature = candidates.find(
      (c) =>
        c.getSenderAddress().toString().toLowerCase() === sender.toLowerCase()
    );

    if (!signature) {
      throw new Error("Signature is not valid");
    }

    if (signature.getValidationErrors().length > 0)
      throw new Error("Transaction validation errors");
    if (!signature.verifySignature()) throw new Error("Signature is not valid");

    return signature;
  }

  // This code can be used to actually relay the transaction to the Ethereum network
  async relayTransaction(signedTransaction: FeeMarketEIP1559Transaction) {
    const serializedTx = bytesToHex(signedTransaction.serialize());
    const relayed = await this.web3.eth.sendSignedTransaction(serializedTx);
    return relayed.transactionHash;
  }
}
