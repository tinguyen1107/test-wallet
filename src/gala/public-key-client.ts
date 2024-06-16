import {
  GetMyProfileDto,
  RegisterEthUserDto,
  RegisterUserDto,
  UpdatePublicKeyDto,
} from "@gala-chain/api";

import { GalachainConnectClient } from ".";

export class PublicKeyClient {
  constructor(
    private client: GalachainConnectClient,
    private url: string,
  ) { }

  public GetMyProfile(dto: GetMyProfileDto) {
    return this.client.sendTransaction(this.url, "GetMyProfile", dto);
  }

  public RegisterUser(dto: RegisterUserDto) {
    return this.client.sendTransaction(this.url, "RegisterUser", dto);
  }

  public RegisterEthUser(dto: RegisterEthUserDto) {
    return this.client.sendTransaction(this.url, "RegisterEthUser", dto);
  }

  public UpdatePublicKey(dto: UpdatePublicKeyDto) {
    return this.client.sendTransaction(this.url, "UpdatePublicKey", dto);
  }
}
