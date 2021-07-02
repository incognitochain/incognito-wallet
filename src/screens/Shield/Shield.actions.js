import { selectedPrivacySelector } from '@src/redux/selectors';
import { getMinMaxDepositAmount } from '@src/services/api/misc';
import {
  genETHDepositAddress,
  genERC20DepositAddress,
  genCentralizedDepositAddress,
  genBSCDepositAddress,
} from '@src/services/api/deposit';
import { portalService } from '@src/services/wallet/portalService'; 
import { CONSTANT_COMMONS } from '@src/constants';
import { signPublicKeyEncodeSelector } from '@src/redux/selectors/account';
import formatUtil from '@utils/format';
import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
  ACTION_TOGGLE_GUIDE,
} from './Shield.constant';
import { shieldSelector } from './Shield.selector';

export const actionFetching = () => ({
  type: ACTION_FETCHING,
});

export const actionFetched = (payload) => ({
  type: ACTION_FETCHED,
  payload,
});

export const actionFetchFail = () => ({
  type: ACTION_FETCH_FAIL,
});

export const actionGetMinMaxShield = async ({ tokenId }) => {
  try {
    return await getMinMaxDepositAmount(tokenId);
  } catch (e) {
    throw 'Can not get min/max amount to deposit';
  }
};

export const actionGetAddressToShield = async ({
  selectedPrivacy,
  account,
  signPublicKeyEncode,
}) => {
  try {
    let generateResult = {};
    if (!selectedPrivacy?.isPToken) {
      return null;
    }
    if (
      selectedPrivacy?.currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.ETH
    ) {
      generateResult = await genETHDepositAddress({
        paymentAddress: account.PaymentAddress,
        walletAddress: account.PaymentAddress,
        tokenId: selectedPrivacy?.tokenId,
        currencyType: selectedPrivacy?.currencyType,
        signPublicKeyEncode,
      });
    } else if (selectedPrivacy?.isErc20Token) {
      generateResult = await genERC20DepositAddress({
        paymentAddress: account.PaymentAddress,
        walletAddress: account.PaymentAddress,
        tokenId: selectedPrivacy?.tokenId,
        tokenContractID: selectedPrivacy?.contractId,
        currencyType: selectedPrivacy?.currencyType,
        signPublicKeyEncode,
      });
    } else if (
      selectedPrivacy?.isBep20Token ||
      selectedPrivacy?.currencyType ===
        CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.BSC_BNB
    ) {
      generateResult = await genBSCDepositAddress({
        paymentAddress: account.PaymentAddress,
        walletAddress: account.PaymentAddress,
        tokenId: selectedPrivacy?.tokenId,
        tokenContractID: selectedPrivacy?.contractId,
        currencyType: selectedPrivacy?.currencyType,
        signPublicKeyEncode,
      });
    } else {
      generateResult = await genCentralizedDepositAddress({
        paymentAddress: account.PaymentAddress,
        walletAddress: account.PaymentAddress,
        tokenId: selectedPrivacy?.tokenId,
        currencyType: selectedPrivacy?.currencyType,
        signPublicKeyEncode,
      });
    }
    const {
      address,
      expiredAt,
      decentralized,
      estimateFee,
      tokenFee,
    } = generateResult;
    if (!address) {
      throw 'Can not gen new deposit address';
    }
    return { address, expiredAt, decentralized, estimateFee, tokenFee };
  } catch (error) {
    throw error;
  }
};

export const actionFetch = ({ tokenId, selectedPrivacy, account }) => async (
  dispatch,
  getState,
) => {
  try {
    const state = getState();
    const { isFetching } = shieldSelector(state);
    const signPublicKeyEncode = signPublicKeyEncodeSelector(state);
    if (!selectedPrivacy || isFetching) {
      return;
    }
    dispatch(actionFetching());
    const [dataMinMax, addressShield] = await Promise.all([
      actionGetMinMaxShield({ tokenId }),
      actionGetAddressToShield({
        selectedPrivacy,
        account,
        signPublicKeyEncode,
      }),
    ]);

    let {
      address,
      expiredAt,
      decentralized,
      tokenFee,
      estimateFee,
    } = addressShield;

    const [min, max] = dataMinMax;
    if (expiredAt) {
      expiredAt = formatUtil.formatDateTime(expiredAt);
    }
    await dispatch(
      actionFetched({
        min,
        max,
        address,
        expiredAt,
        decentralized,
        tokenFee,
        estimateFee,
        isPortal: false,
      }),
    );
  } catch (error) {
    await dispatch(actionFetchFail());
    throw error;
  }
};

export const actionGetPortalMinShieldAmt = async ({ accountWallet, tokenID }) => {
  try {
    let resp =  await accountWallet.handleGetPortalMinShieldAmount({ tokenID });
    return resp;
  } catch (e) {
    throw new Error('Can not get portal min amount to deposit');
  }
};

export const actionPortalFetch = ({ tokenID, selectedPrivacy, account, accountWallet }) => async (
  dispatch,
  getState,
) => {
  try {
    const state = getState();
    const { isFetching } = shieldSelector(state);
    if (!selectedPrivacy || isFetching) {
      return;
    }
    dispatch(actionFetching());
    const [ minShieldAmt, shieldAddress ] = await Promise.all([
      actionGetPortalMinShieldAmt({ accountWallet, tokenID }),
      portalService.generateBTCShieldingAddress(account.paymentAddress),
    ]);

    //todo: add portal shielding address
    
    await dispatch(
      actionFetched({
        min: formatUtil.amountFull(minShieldAmt, selectedPrivacy.pDecimals),
        max: null,
        address: shieldAddress,
        expiredAt: '',
        decentralized: null,
        tokenFee: 0,
        estimateFee: 0,
        isPortal: true,
      }),
    );
  } catch (error) {
    await dispatch(actionFetchFail());
    throw error;
  }
};

export const actionToggleGuide = () => ({
  type: ACTION_TOGGLE_GUIDE,
});
