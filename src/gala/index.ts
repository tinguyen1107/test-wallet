import { ChainCallDTO, serialize, signatures } from "@gala-chain/api";
import { Wallet } from "ethers";
import { BrowserProvider, Eip1193Provider } from "ethers";

import secp256k1 from "secp256k1";

export * from "./public-key-client";
export * from "./rep-client";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

const ENCRYPTION_KEY = "xyz";

export class GalachainConnectClient {
  private address: string;
  private provider: BrowserProvider | undefined;

  public async connectToMetaMask() {
    if (!window.ethereum) {
      throw new Error("Ethereum provider not found");
    }

    this.provider = new BrowserProvider(window.ethereum);

    try {
      const accounts = (await this.provider.send(
        "eth_requestAccounts",
        [],
      )) as string[];
      this.address = accounts[0];

      const request = (await this.provider.send("wallet_switchEthereumChain", [
        {
          chainId: "0x1526",
        },
      ])) as string[];
      this.address = accounts[0];
      return this.address;
    } catch (error: unknown) {
      throw new Error((error as Error).message);
    }
  }

  public async ensureUser() {
    if (!this.provider) {
      throw new Error("Ethereum provider not found");
    }
    if (!this.address) {
      throw new Error("Address not found");
    }

    const keyB64 = (await this.provider.send("eth_getEncryptionPublicKey", [
      this.address,
    ])) as string;
    const publicKey = Buffer.from(keyB64, "base64");
    console.log("Pub", keyB64);

    const pub = secp256k1.publicKeyCreate(
      Uint8Array.from(
        Buffer.from(
          "c3966bba4560468174b8c960672b6d23e49d9f36c2be027c614d0679651ba930",
          "hex",
        ),
      ),
    );
    console.log(
      "Public Key from Secp256k1",
      Buffer.from(pub).toString("base64"),
    );
  }

  public async sendTransaction(
    chaincodeUrl: string,
    method: string,
    payload: object,
  ): Promise<object> {
    if (!this.provider) {
      throw new Error("Ethereum provider not found");
    }
    if (!this.address) {
      throw new Error("No account connected");
    }

    try {
      // const prefix = this.calculatePersonalSignPrefix(payload);
      // const prefixedPayload = { ...payload, prefix };
      const dto = signatures.getPayloadToSign(payload);

      const signer = await this.provider.getSigner();
      const signature = await signer.provider.send("personal_sign", [
        this.address,
        dto,
      ]);

      return await this.submit(chaincodeUrl, method, {
        ...payload,
        signature,
      });
    } catch (error: unknown) {
      throw new Error((error as Error).message);
    }
  }

  public async submit(
    chaincodeUrl: string,
    method: string,
    signedPayload: Record<string, unknown>,
  ): Promise<object> {
    if (signedPayload instanceof ChainCallDTO) {
      await signedPayload.validateOrReject();
    }

    // Note: GalaChain Uri maybe should be constructed based on channel and method,
    // rather than passing full url as arg
    // ie `${baseUri}/api/${channel}/token-contract/${method}`
    const url = `${chaincodeUrl}/${method}`;
    const userId = this.address.replace("0x", "");
    const response = await fetch(url, {
      method: "POST",
      body: serialize(signedPayload),
      headers: {
        "Content-Type": "application/json",
        "x-identity-lookup-key": "client|" + userId,
        "x-user-encryption-key": ENCRYPTION_KEY,
      },
    });

    const id = response.headers.get("x-transaction-id");
    const data = await response.json();

    if (data.error) {
      return data.error;
    }

    return id ? { Hash: id, ...data } : data;
  }

  private calculatePersonalSignPrefix(payload: object): string {
    const payloadLength = signatures.getPayloadToSign(payload).length;
    const prefix = "\u0019Ethereum Signed Message:\n" + payloadLength;

    const newPayload = { ...payload, prefix };
    const newPayloadLength = signatures.getPayloadToSign(newPayload).length;

    if (payloadLength === newPayloadLength) {
      return prefix;
    }
    return this.calculatePersonalSignPrefix(newPayload);
  }
}
