export type EstimateFeeEVMUnShieldResult = {
  feeAddress?: string;
  feeAddressShardID?: number;
  expectedReceive?: number;
  burntAmount?: number;
  feeAmount?: number;
  tokenid?: string;
  privacyFee?: number;
  feeInUSD?: number;
  ID: string;
  protocolFee?: number;
};
