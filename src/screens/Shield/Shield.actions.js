import { selectedPrivacySeleclor } from '@src/redux/selectors';
import { getMinMaxDepositAmount } from '@src/services/api/misc';
import {
  genETHDepositAddress,
  genERC20DepositAddress,
  genCentralizedDepositAddress,
} from '@src/services/api/deposit';
import { CONSTANT_COMMONS } from '@src/constants';
import { setSelectedPrivacy } from '@src/redux/actions/selectedPrivacy';
import { actionAddFollowToken } from '@src/redux/actions/token';
import { defaultAccountSelector } from '@src/redux/selectors/account';
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

export const actionGetAddressToShield = async ({ selectedPrivacy, account }) => {
  try {
    let address;
    if (!selectedPrivacy?.isPToken) {
      return null;
    }
    if (
      selectedPrivacy?.externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ETH
    ) {
      address = await genETHDepositAddress({
        paymentAddress: account.PaymentAddress,
        walletAddress: account.PaymentAddress,
        tokenId: selectedPrivacy?.tokenId,
        currencyType: selectedPrivacy?.currencyType,
      });
    } else if (selectedPrivacy?.isErc20Token) {
      address = await genERC20DepositAddress({
        paymentAddress: account.PaymentAddress,
        walletAddress: account.PaymentAddress,
        tokenId: selectedPrivacy?.tokenId,
        tokenContractID: selectedPrivacy?.contractId,
        currencyType: selectedPrivacy?.currencyType,
      });
    } else {
      address = await genCentralizedDepositAddress({
        paymentAddress: account.PaymentAddress,
        walletAddress: account.PaymentAddress,
        tokenId: selectedPrivacy?.tokenId,
        currencyType: selectedPrivacy?.currencyType,
      });
    }
    if (!address) {
      throw 'Can not gen new deposit address';
    }
    return address;
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
    const selectedPrivacy = selectedPrivacySeleclor.selectedPrivacy(state);
    if (!selectedPrivacy || isFetching) {
      return;
    }
    await dispatch(actionFetching());
    await dispatch(actionAddFollowToken(tokenId));
    const dataMinMax = await actionGetMinMaxShield({ tokenId });
    const address = await actionGetAddressToShield({ selectedPrivacy, account });
    const [min, max] = dataMinMax;
    await dispatch(
      actionFetched({
        min,
        max,
        address,
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
