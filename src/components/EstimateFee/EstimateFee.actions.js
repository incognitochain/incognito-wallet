import {
  getEstimateFeeForNativeToken,
  getEstimateFeeForPToken,
} from '@src/services/wallet/RpcClientService';
import { selectedPrivacySeleclor, accountSeleclor } from '@src/redux/selectors';
import convert from '@src/utils/convert';
import { change, focus } from 'redux-form';
import format from '@src/utils/format';
import { CONSTANT_COMMONS } from '@src/constants';
import floor from 'lodash/floor';
import { getMinMaxWithdrawAmount } from '@src/services/api/misc';
import {
  ACTION_FETCHING_FEE,
  ACTION_FETCHED_FEE,
  ACTION_FETCH_FAIL_FEE,
  ACTION_ADD_FEE_TYPE,
  ACTION_CHANGE_FEE_TYPE,
  ACTION_FETCHED_PTOKEN_FEE,
  ACTION_FETCHED_MIN_PTOKEN_FEE,
  ACTION_CHANGE_FEE,
  ACTION_INIT,
  ACTION_INIT_FETCHED,
  ACTION_FETCHED_MAX_FEE_PRV,
  ACTION_FETCHED_MAX_FEE_PTOKEN,
  ACTION_USE_FEE_MAX,
} from './EstimateFee.constant';
import { apiGetEstimateFeeFromChain } from './EstimateFee.services';
// eslint-disable-next-line import/no-cycle
import { estimateFeeSelector, feeDataSelector } from './EstimateFee.selector';
// eslint-disable-next-line import/no-cycle
import { formName } from './EstimateFee.input';
import {
  MAX_FEE_PER_TX,
  DEFAULT_FEE_PER_KB,
  getMaxAmount,
} from './EstimateFee.utils';

export const actionInitEstimateFee = (config = {}) => async (
  dispatch,
  getState,
) => {
  const state = getState();
  const selectedPrivacy = selectedPrivacySeleclor.selectedPrivacy(state);
  const account = accountSeleclor.defaultAccountSelector(state);
  const wallet = state?.wallet;
  if (!wallet || !account || !selectedPrivacy) {
    return;
  }
  const { screen = 'Send' } = config;
  let rate;
  let minAmount = 1 / 10 ** selectedPrivacy?.pDecimals;
  let minAmountText = format.toFixed(minAmount, selectedPrivacy?.pDecimals);
  try {
    switch (screen) {
    case 'UnShield': {
      rate = 2;
      break;
    }
    default: {
      rate = 1;
      break;
    }
    }
    if (screen === 'UnShield') {
      const [min] = await getMinMaxWithdrawAmount(selectedPrivacy?.tokenId);
      if (min) {
        minAmountText = format.toFixed(min, selectedPrivacy?.pDecimals);
        minAmount = convert.toOriginalAmount(
          minAmountText,
          selectedPrivacy?.pDecimals,
        );
      }
    }
  } catch (error) {
    throw error;
  } finally {
    await dispatch(
      actionInitFetched({
        screen,
        rate,
        minAmount,
        minAmountText,
      }),
    );
  }
};

export const actionFetchedMaxFeePrv = (payload) => ({
  type: ACTION_FETCHED_MAX_FEE_PRV,
  payload,
});

export const actionFetchedMaxFeePToken = (payload) => ({
  type: ACTION_FETCHED_MAX_FEE_PTOKEN,
  payload,
});

export const actionInit = () => ({
  type: ACTION_INIT,
});

export const actionInitFetched = (payload) => ({
  type: ACTION_INIT_FETCHED,
  payload,
});

export const actionFetchingFee = () => ({
  type: ACTION_FETCHING_FEE,
});

export const actionFetchedFee = (payload) => ({
  type: ACTION_FETCHED_FEE,
  payload,
});

export const actionFetchFailFee = () => ({
  type: ACTION_FETCH_FAIL_FEE,
});

export const actionFetchFee = ({ amount, address }) => async (
  dispatch,
  getState,
) => {
  const state = getState();
  const selectedPrivacy = selectedPrivacySeleclor.selectedPrivacy(state);
  let feeEst = null;
  let feePTokenEst = null;
  let minFeePTokenEst = null;
  try {
    const { isFetching, isFetched } = estimateFeeSelector(state);
    if (
      !amount ||
      !address ||
      !selectedPrivacy?.tokenId ||
      isFetching ||
      isFetched
    ) {
      return;
    }
    await dispatch(actionFetchingFee());
    const account = accountSeleclor.defaultAccountSelector(state);
    const wallet = state?.wallet;
    const originalAmount = convert.toOriginalAmount(
      convert.toNumber(amount, true),
      selectedPrivacy?.pDecimals,
    );
    const fromAddress = account?.PaymentAddress;
    const toAddress = address;
    const accountWallet = wallet.getAccountByName(
      account?.name || account?.AccountName,
    );
    if (selectedPrivacy?.isMainCrypto) {
      feeEst = await getEstimateFeeForNativeToken(
        fromAddress,
        toAddress,
        originalAmount,
        accountWallet,
      );
    } else if (selectedPrivacy?.isToken) {
      const tokenObject = {
        Privacy: true,
        TokenID: selectedPrivacy?.tokenId,
        TokenName: selectedPrivacy?.name,
        TokenSymbol: selectedPrivacy?.symbol,
        TokenTxType: CONSTANT_COMMONS.TOKEN_TX_TYPE.SEND,
        TokenAmount: originalAmount,
        TokenReceivers: {
          PaymentAddress: toAddress,
          Amount: originalAmount,
        },
      };
      const feeEstForPToken = await getEstimateFeeForPToken(
        fromAddress,
        toAddress,
        originalAmount,
        tokenObject,
        accountWallet,
      );
      feeEst = Math.max(feeEstForPToken, DEFAULT_FEE_PER_KB);
      let feePTokenEstData = await apiGetEstimateFeeFromChain({
        Prv: feeEst,
        TokenID: selectedPrivacy?.tokenId,
      });
      feePTokenEst = feePTokenEstData;
      minFeePTokenEst = feePTokenEstData;
    }
  } catch (error) {
    if (!feeEst) {
      feeEst = MAX_FEE_PER_TX;
    }
    throw error;
  } finally {
    if (feeEst) {
      await dispatch(
        actionHandleFeeEst({
          feeEst,
        }),
      );
    }
    if (feePTokenEst) {
      await dispatch(actionHandleFeePTokenEst({ feePTokenEst }));
    }
    if (minFeePTokenEst) {
      await dispatch(actionHandleMinFeeEst({ minFeePTokenEst }));
    }
  }
};

export const actionHandleMinFeeEst = ({ minFeePTokenEst }) => async (
  dispatch,
  getState,
) => {
  const state = getState();
  const selectedPrivacy = selectedPrivacySeleclor.selectedPrivacy(state);
  const estimateFee = estimateFeeSelector(state);
  const { rate } = estimateFee;
  const minFeePToken = floor(minFeePTokenEst * rate);
  const minFeePTokenText = format.toFixed(
    convert.toHumanAmount(minFeePToken, selectedPrivacy?.pDecimals),
    selectedPrivacy?.pDecimals,
  );
  await new Promise.all([
    await dispatch(
      actionAddFeeType({
        tokenId: selectedPrivacy?.tokenId,
        symbol: selectedPrivacy?.externalSymbol || selectedPrivacy?.symbol,
      }),
    ),
    await dispatch(
      actionFetchedMinPTokenFee({
        minFeePToken,
        minFeePTokenText,
      }),
    ),
  ]);
};

export const actionHandleFeeEst = ({ feeEst }) => async (
  dispatch,
  getState,
) => {
  const state = getState();
  const estimateFee = estimateFeeSelector(state);
  const { rate } = estimateFee;
  const feePrv = floor(feeEst * rate);
  const feePrvText = format.toFixed(
    convert.toHumanAmount(feePrv, CONSTANT_COMMONS.PRV.pDecimals),
    CONSTANT_COMMONS.PRV.pDecimals,
  );
  await new Promise.all([
    await dispatch(
      actionFetchedFee({
        feePrv,
        feePrvText,
        minFeePrv: feePrv,
        minFeePrvText: feePrvText,
      }),
    ),
    await dispatch(change(formName, 'fee', feePrvText)),
    await dispatch(focus(formName, 'fee')),
  ]);
};

export const actionHandleFeePTokenEst = ({ feePTokenEst }) => async (
  dispatch,
  getState,
) => {
  const state = getState();
  const selectedPrivacy = selectedPrivacySeleclor.selectedPrivacy(state);
  const estimateFee = estimateFeeSelector(state);
  const { rate } = estimateFee;
  const feePToken = floor(feePTokenEst * rate);
  const feePTokenText = format.toFixed(
    convert.toHumanAmount(feePToken, selectedPrivacy?.pDecimals),
    selectedPrivacy?.pDecimals,
  );
  await dispatch(
    actionFetchedPTokenFee({
      feePToken,
      feePTokenText,
    }),
  );
};

export const actionAddFeeType = (payload) => ({
  type: ACTION_ADD_FEE_TYPE,
  payload,
});

export const actionChangeFeeType = (payload) => ({
  type: ACTION_CHANGE_FEE_TYPE,
  payload,
});

export const actionFetchedPTokenFee = (payload) => ({
  type: ACTION_FETCHED_PTOKEN_FEE,
  payload,
});

export const actionFetchedMinPTokenFee = (payload) => ({
  type: ACTION_FETCHED_MIN_PTOKEN_FEE,
  payload,
});

export const actionChangeFee = (payload) => ({
  type: ACTION_CHANGE_FEE,
  payload,
});

export const actionUseFeeMax = () => ({
  type: ACTION_USE_FEE_MAX,
});

export const actionFetchFeeByMax = () => async (dispatch, getState) => {
  const state = getState();
  const selectedPrivacy = selectedPrivacySeleclor.selectedPrivacy(state);
  const estimateFee = estimateFeeSelector(state);
  const { isUseTokenFee } = feeDataSelector(state);
  const { amount, isMainCrypto, pDecimals, tokenId, isToken } = selectedPrivacy;
  const { isFetched, feePToken, feePrv, isFetching } = estimateFee;
  const feeEst = MAX_FEE_PER_TX;
  let _amount = Math.max(isMainCrypto ? amount - feeEst : amount, 0);
  let maxAmount = floor(_amount, pDecimals);
  let maxAmountText = format.toFixed(
    convert.toHumanAmount(maxAmount, pDecimals),
    pDecimals,
  );
  if (isFetching) {
    return;
  }
  try {
    if (isFetched) {
      const { maxAmountText: _maxAmountText } = getMaxAmount({
        selectedPrivacy,
        isUseTokenFee,
        feePToken,
        feePrv,
      });
      maxAmountText = _maxAmountText;
    } else {
      await dispatch(actionFetchingFee());
      await dispatch(actionUseFeeMax());
      if (isToken) {
        const feePTokenEst = await apiGetEstimateFeeFromChain({
          Prv: feeEst,
          TokenID: tokenId,
        });
        if (feePTokenEst) {
          await new Promise.all([
            dispatch(actionHandleFeePTokenEst({ feePTokenEst })),
            dispatch(actionHandleMinFeeEst({ minFeePTokenEst: feePTokenEst })),
          ]);
        }
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    if (!isFetched) {
      await dispatch(
        actionHandleFeeEst({
          feeEst,
        }),
      );
    }
    // eslint-disable-next-line no-unsafe-finally
    return maxAmountText;
  }
};
