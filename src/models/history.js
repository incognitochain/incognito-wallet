import { CONSTANT_COMMONS } from '@src/constants';

export const DECENTRALIZED_RECEIVE_TYPES = [ 27, 240, 252, 96, 242, 274, 275 ];

class History {
  static parsePrivateTokenFromApi(data = {}) {
    const status = data?.Status;
    // const statusText = getStatusText(status, data.Decentralized);// ? why need this???
    const decentralized = data.Decentralized;
    const depositTmpAddress =
      data.AddressType === CONSTANT_COMMONS.HISTORY.TYPE.SHIELD && data.Address;
    const isShieldTx = !!depositTmpAddress;

    //const isDecentralized = decentralized; // now this is a number, not bool, remove this.

    const {
      STATUS_CODE_SHIELD_CENTRALIZED,
    } = CONSTANT_COMMONS.HISTORY;

    // RESUME shield expired only for centralized coins.
    // 0 centralized | 1 ETH, ERC20 temp address expired | 2 ETH, ERC20 fixed address | 3 BSC decentralized BSC fixed address
    const canRetryExpiredDeposit = (
      decentralized === 0
      && data.AddressType === CONSTANT_COMMONS.HISTORY.TYPE.SHIELD
      && STATUS_CODE_SHIELD_CENTRALIZED.EXPIRED.includes(status)
    );

    // Remove/cancel shield centrailzed only for pending/expired.
    const cancelable = (
      data.AddressType === CONSTANT_COMMONS.HISTORY.TYPE.SHIELD
      && decentralized === 0
      && (status === STATUS_CODE_SHIELD_CENTRALIZED.PENDING || STATUS_CODE_SHIELD_CENTRALIZED.EXPIRED.includes(status))
    );

    const history = {
      id: data?.ID,
      createdAt: data?.CreatedAt,
      updatedAt: data.UpdatedAt,
      expiredAt: data.ExpiredAt,
      addressType: data.AddressType,
      status,
      decentralized,
      statusText: data?.StatusMessage, //statusText, // no need this anymore..., ask Phuong.
      currencyType: data.CurrencyType,
      userPaymentAddress: data.UserPaymentAddress,
      erc20TokenAddress: data.Erc20TokenAddress,
      privacyTokenAddress: data.PrivacyTokenAddress,
      requestedAmount: data.RequestedAmount,
      receivedAmount: data?.ReceivedAmount || 0,
      incognitoAmount: data.IncognitoAmount,
      outchainTx: data.OutChainTx,
      inchainTx: data.InChainTx,
      cancelable: cancelable, // Phuong add
      walletAddress: data.WalletAddress,
      canRetryExpiredDeposit: canRetryExpiredDeposit, // Phuong add.
      depositTmpAddress,
      privacyFee: Number(data?.OutChainPrivacyFee),
      tokenFee: Number(data?.OutChainTokenFee),
      burnPrivacyFee: Number(data?.BurnPrivacyFee),
      burnTokenFee: Number(data?.BurnTokenFee),
      incognitoTxID: data?.IncognitoTxToPayOutsideChainFee,
      statusMessage: data?.StatusMessage,
      statusDetail: data?.StatusDetail,
      isShieldTx,
      // isDecentralized, // same decentralized!
      incognitoTx: data?.IncognitoTx,
      memo: data?.Memo || data?.Info,
      shieldFee: data?.TokenFee || 0,
      receivedTx: data?.TxReceive || '',
    };
    return history;
  }
}

export default History;
