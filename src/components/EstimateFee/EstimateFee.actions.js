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
import accountService from '@services/wallet/accountService';
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
} from './EstimateFee.constant';
import { apiGetEstimateFeeFromChain } from './EstimateFee.services';
// eslint-disable-next-line import/no-cycle
import { estimateFeeSelector } from './EstimateFee.selector';
// eslint-disable-next-line import/no-cycle
import { formName } from './EstimateFee.input';
import { MAX_FEE_PER_TX, DEFAULT_FEE_PER_KB } from './EstimateFee.utils';

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
  let minAmountText = format.amountFull(minAmount);
  let amount,
    amountText,
    maxFeePrv,
    maxFeePrvText,
    maxFeePToken,
    maxFeePTokenText;
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
        minAmountText = format.amountFull(min);
        minAmount = convert.toOriginalAmount(
          minAmountText,
          selectedPrivacy?.pDecimals,
        );
      }
    }
    const [accountBalance, tokenBalance] = await new Promise.all([
      accountService.getBalance(account, wallet, CONSTANT_COMMONS.PRV.id),
      accountService.getBalance(account, wallet, selectedPrivacy?.tokenId),
    ]);
    console.log('accountBalance', accountBalance, 'tokenBalance', tokenBalance);
    maxFeePrv = accountBalance;
    maxFeePrvText = format.amountFull(
      convert.toHumanAmount(maxFeePrv, CONSTANT_COMMONS.PRV.pDecimals),
    );
    amount = tokenBalance;
    amountText = format.amountFull(
      convert.toHumanAmount(amount, selectedPrivacy.pDecimals),
    );
    maxFeePToken = tokenBalance;
    maxFeePTokenText = format.amountFull(
      convert.toHumanAmount(maxFeePToken, selectedPrivacy?.pDecimals),
    );
  } catch (error) {
    throw error;
  } finally {
    await dispatch(
      actionInitFetched({
        amount,
        amountText,
        maxFeePrv,
        maxFeePrvText,
        maxFeePToken,
        maxFeePTokenText,
        screen,
        rate,
        minAmount,
        minAmountText,
      }),
    );
  }
};

export const actionInit = () => ({
  type: ACTION_INIT,
});

export const actionInitFetched = payload => ({
  type: ACTION_INIT_FETCHED,
  payload,
});

export const actionFetchingFee = () => ({
  type: ACTION_FETCHING_FEE,
});

export const actionFetchedFee = payload => ({
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
  const estimateFee = estimateFeeSelector(state);
  const { rate } = estimateFee;
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
      feePTokenEstData = Math.max(feePTokenEstData, feeEst);
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
      const feePrv = floor(feeEst * rate);
      const feePrvText = format.amountFull(
        convert.toHumanAmount(feePrv, CONSTANT_COMMONS.PRV.pDecimals),
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
    }
    if (feePTokenEst) {
      const feePToken = floor(feePTokenEst * rate);
      const feePTokenText = format.amountFull(
        convert.toHumanAmount(feePToken, selectedPrivacy?.pDecimals),
      );
      await dispatch(
        actionFetchedPTokenFee({
          feePToken,
          feePTokenText,
        }),
      );
    }
    if (minFeePTokenEst) {
      const minFeePToken = floor(minFeePTokenEst * rate);
      const minFeePTokenText = format.amountFull(
        convert.toHumanAmount(minFeePToken, selectedPrivacy?.pDecimals),
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
    }
  }
};

export const actionAddFeeType = payload => ({
  type: ACTION_ADD_FEE_TYPE,
  payload,
});

export const actionChangeFeeType = payload => ({
  type: ACTION_CHANGE_FEE_TYPE,
  payload,
});

export const actionFetchedPTokenFee = payload => ({
  type: ACTION_FETCHED_PTOKEN_FEE,
  payload,
});

export const actionFetchedMinPTokenFee = payload => ({
  type: ACTION_FETCHED_MIN_PTOKEN_FEE,
  payload,
});

export const actionChangeFee = payload => ({
  type: ACTION_CHANGE_FEE,
  payload,
});
