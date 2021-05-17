import { selectedPrivacySelector } from '@src/redux/selectors';
import { getMinMaxDepositAmount } from '@src/services/api/misc';
import {
  genETHDepositAddress,
  genERC20DepositAddress,
  genCentralizedDepositAddress,
} from '@src/services/api/deposit';
import { CONSTANT_COMMONS } from '@src/constants';
import { setSelectedPrivacy } from '@src/redux/actions/selectedPrivacy';
import { actionAddFollowToken } from '@src/redux/actions/token';
import {
  defaultAccountSelector,
  signPublicKeyEncodeSelector
} from '@src/redux/selectors/account';
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

export const actionGetAddressToShield = async ({ selectedPrivacy, account, signPublicKeyEncode }) => {
  try {
    let generateResult = {};
    if (!selectedPrivacy?.isPToken) {
      return null;
    }
    if (
      selectedPrivacy?.externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ETH
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
        signPublicKeyEncode
      });
    } else {
      generateResult = await genCentralizedDepositAddress({
        paymentAddress: account.PaymentAddress,
        walletAddress: account.PaymentAddress,
        tokenId: selectedPrivacy?.tokenId,
        currencyType: selectedPrivacy?.currencyType,
        signPublicKeyEncode
      });
    }
    const { address, expiredAt, newShieldDecentralized: isShieldAddressDecentralized, estimateFee, tokenFee } = generateResult;

    if (!address) {
      throw 'Can not gen new deposit address';
    }
    return { address, expiredAt, isShieldAddressDecentralized: Boolean(isShieldAddressDecentralized || 0), estimateFee, tokenFee };
  } catch (error) {
    throw error;
  }
};

export const actionFetch = ({ tokenId }) => async (dispatch, getState) => {
  try {
    await dispatch(setSelectedPrivacy(tokenId));
    const state = getState();
    const account = defaultAccountSelector(state);
    const { isFetching } = shieldSelector(state);
    const selectedPrivacy = selectedPrivacySelector.selectedPrivacy(state);
    const signPublicKeyEncode = signPublicKeyEncodeSelector(state);
    if (!selectedPrivacy || isFetching) {
      return;
    }
    await dispatch(actionFetching());
    await dispatch(actionAddFollowToken(tokenId));
    const dataMinMax = await actionGetMinMaxShield({ tokenId });
    let {
      address,
      expiredAt,
      isShieldAddressDecentralized,
      tokenFee,
      estimateFee,
    } = await actionGetAddressToShield({ selectedPrivacy, account, signPublicKeyEncode });
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
        isShieldAddressDecentralized,
        tokenFee,
        estimateFee,
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
