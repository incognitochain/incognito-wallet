const PRIVACY_VERSION = 2;
const REMOTE_ADDRESS = '0x0000000000000000000000000000000000000000';

type InterSwapPayload = {
    midOTA: string;
    sellTokenID: string;
    buyTokenID: string;
    midToken: string;
    amountOutRaw: string;
    slippage: string;
    pAppNetwork: string;
    pAppName: string;
    inputAddress: string;
}

export type CreateTransactionPAppsPayload = {
  pDexV3Instance: any;
  sellTokenID: string;
  senderFeeAddressShardID: number;

  feeReceiverAddress: string;
  feeTokenID: string;
  feeAmount: string;

  sellAmount: string;
  callContract: string;
  callData: string;
  exchangeNetworkID: number;

  sellChildTokenID: string;
  buyContractID: string;

  remoteAddress?: string;

  buyTokenID: string;
  sellAmountText: string;
  buyAmountText: string;
  interSwapData: InterSwapPayload;
};

export type CreateTransactionPDexPayload = {
  pDexV3Instance: any;
  params: {
    transfer: {
      fee: number;
      info: string;
    };
    extra: {
      tokenIDToSell: string;
      sellAmount: string;
      tokenIDToBuy: string;
      feetoken: string;
      minAcceptableAmount: string;
      tradePath: string[];
      tradingFee: number;
      version: number;
      sellAmountText: string;
      buyAmountText: string;
      interSwapData: InterSwapPayload;
    };
  };
};

const createTransactionPApps = async (
  params: CreateTransactionPAppsPayload,
) => {
  try {
    const {
      pDexV3Instance,
      sellTokenID,
      senderFeeAddressShardID,

      feeReceiverAddress,
      feeTokenID,
      feeAmount,

      sellAmount,
      callContract,
      callData,
      exchangeNetworkID,

      sellChildTokenID,
      buyContractID,

      remoteAddress = REMOTE_ADDRESS,
      buyTokenID,
      sellAmountText,
      buyAmountText,
      interSwapData
    } = params;

    console.log('[createTransactionPApps] params ', params);
    console.log('[createTransactionPApps] remoteAddress ', remoteAddress);
    const tx = await pDexV3Instance.createTransactionPApps({
      transfer: { version: PRIVACY_VERSION },
      extra: {
        sellTokenID,
        senderFeeAddressShardID,

        feeReceiverAddress,
        feeAmount,
        feeTokenID,

        // data metadata
        sellAmount,
        callContract, // proxy route
        callData,
        exchangeNetworkID, // networkID exchange, exp: ETH = 1
        sellChildTokenID,
        buyContractID,
        // remoteAddress, case reDeposit = 0x0000000000000000000000000000000000000000
        // send out EVN use user address
        remoteAddress,
        buyTokenID,
        sellAmountText,
        buyAmountText,
        interSwapData
      },
    });
    console.log('[createTransactionPApps] tx ', tx);
    if (!tx) {
      console.log('[createTransactionPApps] tx = undefined, TO DO ');
    } else {
      return tx;
    }
  } catch (error) {
    console.log('[createTransactionPApps] ERROR ', error);
    throw error;
  }
};

const createTransactionPDex = async (payload: CreateTransactionPDexPayload) => {
  try {
    const { pDexV3Instance, params } = payload;

    console.log('[createTransactionPDex] params ', params);

    const tx = await pDexV3Instance.createAndSendSwapRequestTx(params);
    console.log('[createTransactionPDex] tx ', tx);
    if (!tx) {
      console.log('[createTransactionPDex] tx = undefined, TO DO ');
    } else {
      return tx;
    }
  } catch (error) {
    console.log('[createTransactionPDex] ERROR ', error);
    throw error;
  }
};

const TransactionHandler = {
  createTransactionPApps,
  createTransactionPDex,
};

export default TransactionHandler;
