class Node {
  constructor(data = {}) {
    this.qrCode                 = data?.QRCode;
    this.pulicKey               = data?.PublicKey;
    this.bls                    = data?.BLS;
    this.isInAutoStaking        = data?.IsInAutoStaking;
    this.isInCommittee          = data?.IsInCommittee;
    this.isAutoStake            = data?.IsAutoStake;
    this.pendingWithdrawal      = data?.PendingWithdrawal;
    this.pendingUnstake         = data?.PendingUnstake;
    this.isUnstaked             = data?.IsUnstaked;
    this.isStaked               = data?.IsStaked;
    this.lastestFirmwareVersion = data?.LastestFirmwareVersion;
    this.rewards                = (data?.Rewards || []).map((reward) => ({
      tokenID: reward?.TokenID,
      decimals: reward?.Decimals,
      Symbol: reward?.Symbol,
      amount: reward?.Amount
    }));
  }

  toJSON(){
    return{
      name:this.name,
      AccountName:this.name,
      value:this.value,
      PaymentAddress:this.PaymentAddress,
      ReadonlyKey : this.ReadonlyKey,
      PrivateKey:this.PrivateKey,
      PublicKey:this.PublicKey,
      PublicKeyCheckEncode:this.PublicKeyCheckEncode,
      PublicKeyBytes:this.PublicKeyBytes,
      BLSPublicKey:this.BLSPublicKey,
      ValidatorKey:this.ValidatorKey
    };
  }
}

export default Node;