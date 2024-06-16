import { GalachainConnectClient } from ".";
// /api/rep/rep-contract/GetAccounts

export class RepClient {
  constructor(
    private client: GalachainConnectClient,
    private url: string,
  ) {}

  public getAccounts() {
    return this.client.sendTransaction(this.url, "GetAccounts", {
      payload: {
        limit: 10,
      },
      path: "/api/rep/rep-contract/GetAccounts",
    });
  }
}
