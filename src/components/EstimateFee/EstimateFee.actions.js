/* eslint-disable no-unsafe-finally */
/* eslint-disable import/no-cycle */
import {
  selectedPrivacySelector,
  childSelectedPrivacySelector,
  accountSelector,
} from '@src/redux/selectors';
import convert from '@src/utils/convert';
import { change, focus } from 'redux-form';
import format from '@src/utils/format';
import { CONSTANT_COMMONS } from '@src/constants';
import floor from 'lodash/floor';
import { trim } from 'lodash';
import {
  estimateUserFees,
  estimateFeeDecentralized,
  genCentralizedWithdrawAddress,
} from '@src/services/api/withdraw';
import { PRVIDSTR } from 'incognito-chain-web-js/build/wallet';
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
  ACTION_FETCHED_VALID_ADDR,
  ACTION_FETCHED_USER_FEES,
  ACTION_FETCHING_USER_FEES,
  ACTION_TOGGLE_FAST_FEE,
  ACTION_REMOVE_FEE_TYPE,
  ACTION_FETCH_FAIL_USER_FEES,
  ACTION_RESET_FORM_SUPPORT_SEND_IN_CHAIN,
} from './EstimateFee.constant';
import { apiCheckValidAddress } from './EstimateFee.services';
import { estimateFeeSelector, feeDataSelector } from './EstimateFee.selector';
import { formName } from './EstimateFee.input';
import { MAX_FEE_PER_TX, getMaxAmount, getTotalFee } from './EstimateFee.utils';
import { EstimateFeeEVMUnShieldResult } from './EstimateFee.type';

export const actionInitEstimateFee =
  (config = {}) =>
  async (dispatch, getState) => {
    const state = getState();
    const selectedPrivacy = selectedPrivacySelector.selectedPrivacy(state);
    const account = accountSelector.defaultAccountSelector(state);
    const wallet = state?.wallet;

    if (!wallet || !account || !selectedPrivacy) {
      return;
    }
    const { screen = 'Send' } = config;
    let rate = 1;
    if (screen === 'UnShield' && selectedPrivacy?.isCentralized) {
      rate = 2;
    }
    await dispatch(
      actionInitFetched({
        screen,
        rate,
        isAddressValidated: true,
        isValidETHAddress: true,
      }),
    );
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

export const actionFetchFee =
  ({ amount, address, screen, memo }) =>
  async (dispatch, getState) => {
    const state = getState();
    const parentSelectedPrivacy =
      selectedPrivacySelector.selectedPrivacy(state);
    const childSelectedPrivacy =
      childSelectedPrivacySelector.childSelectedPrivacy(state);
    const selectedPrivacy =
      childSelectedPrivacy && childSelectedPrivacy?.networkId !== 'INCOGNITO'
        ? childSelectedPrivacy
        : parentSelectedPrivacy;
    let feeEst = MAX_FEE_PER_TX;
    let feePTokenEst = null;
    let minFeePTokenEst = null;
    const originalAmount = convert.toOriginalAmount(
      amount,
      parentSelectedPrivacy?.pDecimals,
    );
    const _originalAmount = Number(originalAmount);
    try {
      const { init } = estimateFeeSelector(state);
      if (
        !init ||
        !amount ||
        !address ||
        !selectedPrivacy?.tokenId ||
        !childSelectedPrivacy ||
        _originalAmount === 0
      ) {
        return;
      }
      await dispatch(actionFetchingFee());
      await dispatch(actionInitEstimateFee({ screen }));
      if (selectedPrivacy && screen === 'UnShield') {
        const isAddressValidated = await dispatch(
          actionValAddr(address, childSelectedPrivacy),
        );
        if (isAddressValidated) {
          await dispatch(
            actionFetchUserFees({
              address,
              amount,
              memo,
              childSelectedPrivacy,
            }),
          );
        }
      } else {
        dispatch(actionResetFormSupportSendInChain());
      }
    } catch (error) {
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

export const actionHandleMinFeeEst =
  ({ minFeePTokenEst }) =>
  async (dispatch, getState) => {
    const state = getState();
    const parentSelectedPrivacy =
      selectedPrivacySelector.selectedPrivacy(state);
    const childSelectedPrivacy =
      childSelectedPrivacySelector.childSelectedPrivacy(state);
    const selectedPrivacy =
      childSelectedPrivacy && childSelectedPrivacy?.networkId !== 'INCOGNITO'
        ? childSelectedPrivacy
        : parentSelectedPrivacy;
    const estimateFee = estimateFeeSelector(state);
    const { rate } = estimateFee;
    const { userFees, isUnShield } = feeDataSelector(state);
    const isFreeFeePToken = !userFees?.data?.TokenFees;
    const isFreeFeePrivacy = !userFees?.data?.PrivacyFees;
    const isFreeFee = isFreeFeePToken && isFreeFeePrivacy;
    const minFeePToken = floor(minFeePTokenEst * rate);
    const minFeePTokenText = format.toFixed(
      convert.toHumanAmount(minFeePToken, parentSelectedPrivacy?.pDecimals),
      parentSelectedPrivacy?.pDecimals,
    );
    let task = [
      dispatch(
        actionFetchedMinPTokenFee({
          minFeePToken,
          minFeePTokenText,
        }),
      ),
      dispatch(
        actionAddFeeType({
          tokenId: selectedPrivacy?.tokenId,
          symbol: selectedPrivacy?.externalSymbol || selectedPrivacy?.symbol,
        }),
      ),
    ];
    await new Promise.all(task);
    if (isUnShield && !!userFees?.isFetched) {
      if (isFreeFee) {
        return;
      }
      if (isFreeFeePToken) {
        return await dispatch(
          actionRemoveFeeType({ tokenId: selectedPrivacy?.tokenId }),
        );
      }
    }
  };

export const actionHandleFeeEst =
  ({ feeEst }) =>
  async (dispatch, getState) => {
    let feePrv, feePrvText, totalFeePrv, totalFeePrvText, userFeePrv;
    let totalFeePToken, totalFeePTokenText, userFeePToken;
    let totalFees;
    const state = getState();
    const {
      rate,
      fast2x,
      userFees,
      isUsedPRVFee,
      isUnShield,
      feePDecimals,
      hasMultiLevel,
    } = feeDataSelector(state);
    const { isFetched } = userFees;
    try {
      feePrv = floor(feeEst * rate);
      feePrvText = format.toFixed(
        convert.toHumanAmount(feePrv, CONSTANT_COMMONS.PRV.pDecimals),
        CONSTANT_COMMONS.PRV.pDecimals,
      );
      totalFeePrv = feePrv;
      totalFeePrvText = feePrvText;
      if (isUnShield && isFetched) {
        const { totalFee, totalFeeText, userFee } = getTotalFee({
          fast2x,
          userFeesData: userFees?.data,
          feeEst: feePrv,
          rate,
          pDecimals: feePDecimals,
          isUsedPRVFee,
          hasMultiLevel,
          isUnShield,
        });
        totalFees = totalFee;
        if (isUsedPRVFee) {
          totalFeePrv = totalFee;
          totalFeePrvText = totalFeeText;
          userFeePrv = userFee;
        } else {
          totalFeePToken = totalFee;
          totalFeePTokenText = totalFeeText;
          userFeePToken = userFee;
        }
      }
    } catch (error) {
      throw error;
    } finally {
      await dispatch(
        actionFetchedFee({
          feePrv,
          feePrvText,
          minFeePrv: feePrv,
          minFeePrvText: feePrvText,
          totalFeePrv,
          totalFeePrvText,
          userFeePrv,
          totalFeePToken,
          totalFeePTokenText,
          userFeePToken,
          totalFees,
        }),
      );
      await new Promise.all([
        await dispatch(
          change(
            formName,
            'fee',
            isUsedPRVFee ? totalFeePrvText : totalFeePTokenText,
          ),
        ),
        await dispatch(focus(formName, 'fee')),
      ]);
    }
  };

export const actionHandleFeePTokenEst =
  ({ feePTokenEst }) =>
  async (dispatch, getState) => {
    let feePToken,
      feePTokenText,
      totalFeePToken,
      totalFeePTokenText,
      userFeePToken;
    const state = getState();
    const parentSelectedPrivacy =
      selectedPrivacySelector.selectedPrivacy(state);
    const { rate, userFees, fast2x, isUseTokenFee, isUnShield, hasMultiLevel } =
      feeDataSelector(state);
    const { isFetched } = userFees;
    try {
      feePToken = floor(feePTokenEst * rate);
      feePTokenText = format.toFixed(
        convert.toHumanAmount(feePToken, parentSelectedPrivacy?.pDecimals),
        parentSelectedPrivacy?.pDecimals,
      );
      totalFeePToken = feePToken;
      totalFeePTokenText = feePTokenText;
      if (isUnShield && isFetched) {
        const { totalFee, totalFeeText, userFee } = getTotalFee({
          fast2x,
          userFeesData: userFees?.data,
          feeEst: feePToken,
          rate,
          pDecimals: parentSelectedPrivacy?.pDecimals,
          isUsedPRVFee: false,
          hasMultiLevel,
        });
        totalFeePToken = totalFee;
        totalFeePTokenText = totalFeeText;
        userFeePToken = userFee;
      }
    } catch (error) {
      throw error;
    } finally {
      await dispatch(
        actionFetchedPTokenFee({
          feePToken,
          feePTokenText,
          totalFeePToken,
          totalFeePTokenText,
          userFeePToken,
        }),
      );
      if (isUseTokenFee) {
        await new Promise.all([
          await dispatch(change(formName, 'fee', totalFeePTokenText)),
          await dispatch(focus(formName, 'fee')),
        ]);
      }
    }
  };

export const actionRemoveFeeType = (payload) => ({
  type: ACTION_REMOVE_FEE_TYPE,
  payload,
});

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

export const actionFetchFeeByMax = () => async (dispatch, getState) => {
  const state = getState();
  const parentSelectedPrivacy = selectedPrivacySelector.selectedPrivacy(state);
  const { isUseTokenFee, isFetched, totalFee, isFetching } =
    feeDataSelector(state);
  const { amount, isMainCrypto } = parentSelectedPrivacy;
  const feeEst = MAX_FEE_PER_TX;
  let _amount = Math.max(isMainCrypto ? amount - feeEst : amount, 0);
  let maxAmount = floor(_amount, parentSelectedPrivacy.pDecimals);
  let maxAmountText = format.toFixed(
    convert.toHumanAmount(maxAmount, parentSelectedPrivacy.pDecimals),
    parentSelectedPrivacy.pDecimals,
  );
  if (isFetching) {
    return;
  }
  try {
    if (isFetched) {
      const { maxAmountText: _maxAmountText } = getMaxAmount({
        selectedPrivacy: parentSelectedPrivacy,
        isUseTokenFee,
        totalFee,
      });
      maxAmountText = _maxAmountText;
    } else {
      await dispatch(actionFetchingFee());
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
  }
  return maxAmountText;
};

export const actionFetchedValidAddr = (payload) => ({
  type: ACTION_FETCHED_VALID_ADDR,
  payload,
});

export const actionValAddr =
  (address = '', childSelectedPrivacy = null) =>
  async (dispatch, getState) => {
    let isAddressValidated = true;
    let isValidETHAddress = true;
    const state = getState();
    const selectedPrivacy =
      childSelectedPrivacy && childSelectedPrivacy?.networkId !== 'INCOGNITO'
        ? childSelectedPrivacy
        : selectedPrivacySelector.selectedPrivacy(state);
    const { isUnShield } = feeDataSelector(state);
    if (
      !isUnShield ||
      (childSelectedPrivacy === null && selectedPrivacy?.isMainCrypto)
    ) {
      return;
    }
    try {
      const _address = trim(address);
      if (_address) {
        const validAddr = await apiCheckValidAddress(
          _address,
          selectedPrivacy?.currencyType,
        );
        isAddressValidated = !!validAddr?.data?.Result;
        // const isAddressERC20Valid = walletValidator.validate(
        //   _address,
        //   CONSTANT_COMMONS.CRYPTO_SYMBOL.ETH,
        //   'both',
        // );
        // const isERC20 =
        //   selectedPrivacy?.isErc20Token ||
        //   selectedPrivacy?.externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ETH;
        //check is smart contract address
        // if (isERC20 && isAddressERC20Valid && !!_address) {
        //   const validETHAddr = await apiCheckIfValidAddressETH(_address);
        //   isValidETHAddress = !!validETHAddr?.data?.Result;
        // }
      }
    } catch (error) {
      throw error;
    } finally {
      await dispatch(
        actionFetchedValidAddr({
          isAddressValidated,
          isValidETHAddress,
          childSelectedPrivacy,
        }),
      );
    }
    return isAddressValidated;
  };

export const actionFetchedUserFees = (payload) => ({
  type: ACTION_FETCHED_USER_FEES,
  payload,
});

export const actionFetchingUserFees = () => ({
  type: ACTION_FETCHING_USER_FEES,
});

export const actionFetchFailUserFees = (payload) => ({
  type: ACTION_FETCH_FAIL_USER_FEES,
  payload,
});

export const actionResetFormSupportSendInChain = () => ({
  type: ACTION_RESET_FORM_SUPPORT_SEND_IN_CHAIN,
});

export const actionFetchUserFees = (payload) => async (dispatch, getState) => {
  let userFeesData;
  const state = getState();
  const {
    address: paymentAddress,
    memo,
    amount: requestedAmount,
    childSelectedPrivacy,
  } = payload;
  const parentTokenSelectedPrivacy =
    selectedPrivacySelector.selectedPrivacy(state);

  const selectedPrivacy =
    childSelectedPrivacy && childSelectedPrivacy?.networkId !== 'INCOGNITO'
      ? childSelectedPrivacy
      : parentTokenSelectedPrivacy;
  const signPublicKeyEncode =
    accountSelector.signPublicKeyEncodeSelector(state);
  const {
    tokenId,
    contractId,
    currencyType,
    isErc20Token,
    externalSymbol,
    paymentAddress: walletAddress,
    isDecentralized,
    isBep20Token,
    isPolygonErc20Token,
    isFantomErc20Token,
    isAvaxErc20Token,
    isAuroraErc20Token,
    isNearToken,
    symbol,
  } = selectedPrivacy;
  const { isETH, isUsedPRVFee, userFees, isUnShield } = feeDataSelector(state);
  const originalAmount = convert.toOriginalAmount(
    requestedAmount,
    parentTokenSelectedPrivacy.pDecimals,
  );
  userFeesData = { ...userFees?.data };
  let _error;
  if (!isUnShield) {
    return;
  }
  try {
    await dispatch(actionFetchingUserFees());
    if (isDecentralized) {
      const data = {
        requestedAmount,
        originalAmount,
        paymentAddress,
        walletAddress,
        tokenContractID:
          isETH ||
          currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.BSC_BNB
            ? ''
            : contractId,
        // tokenId: childSelectedPrivacy?.tokenId,
        tokenId: parentTokenSelectedPrivacy?.isPUnifiedToken
          ? parentTokenSelectedPrivacy?.tokenId
          : childSelectedPrivacy?.tokenId,
        burningTxId: '',
        currencyType: currencyType,
        isErc20Token: isErc20Token,
        isBep20Token: isBep20Token,
        isPolygonErc20Token: isPolygonErc20Token,
        isFantomErc20Token: isFantomErc20Token,
        isAvaxErc20Token: isAvaxErc20Token,
        isAuroraErc20Token: isAuroraErc20Token,
        isNearToken: isNearToken,
        externalSymbol: externalSymbol,
        isUsedPRVFee,
        signPublicKeyEncode,
        unifiedTokenId: parentTokenSelectedPrivacy?.isPUnifiedToken
          ? parentTokenSelectedPrivacy?.tokenId
          : '',
      };
      if (
        isNearToken ||
        currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.NEAR
      ) {
        userFeesData = await estimateUserFees(data);

        console.log(
          '[actionFetchUserFees][NEAR CASE] userFeesData ',
          userFeesData,
        );
      } else {
        // let userFeesData = await estimateUserFees(data);

        let userFeeDataNew: EstimateFeeEVMUnShieldResult =
          await estimateFeeDecentralized(data);

        // Map new data structure to old data structure
        userFeesData = {
          // ID: userFeeDataNew.ID || 12345,
          FeeAddress: userFeeDataNew.feeAddress || '',
          EstimateReceivedAmount: {
            ExpectedAmount: userFeeDataNew.expectedReceive || 0,
            Fee: userFeeDataNew.protocolFee || 0,
            BurntAmount: userFeeDataNew.burntAmount || 0,
          },
          FeeAddressShardID: userFeeDataNew.feeAddressShardID || 0,
        };

        // Add fields for userFeesData Object
        if (userFeeDataNew.tokenid !== PRVIDSTR) {
          userFeesData.TokenFees = {
            Level1: userFeeDataNew.feeAmount || 0,
          };
        } else {
          userFeesData.PrivacyFees = {
            Level1: userFeeDataNew.feeAmount || 0,
          };
        }
        console.log('[actionFetchUserFees] userFeesData ', userFeesData);
      }
    } else {
      const payload = {
        originalAmount,
        requestedAmount,
        paymentAddress,
        walletAddress,
        tokenId: tokenId,
        currencyType: currencyType,
        memo,
        signPublicKeyEncode,
      };
      const _userFeesData = await genCentralizedWithdrawAddress(payload);
      userFeesData = {
        ..._userFeesData,
      };
    }
  } catch (error) {
    _error = error;
    throw error;
  } finally {
    if (_error && _error?.code === 'API_ERROR(-1027)') {
      await dispatch(actionFetchFailUserFees(true));
      return;
    }
    if (!userFeesData.FeeAddress || _error) {
      await dispatch(actionFetchFailUserFees());
      throw new Error('Please try again.');
    }
    let actived = PRVIDSTR;
    let feeTypes = [{ tokenId: PRVIDSTR, symbol: 'PRV' }];
    if (userFeesData.TokenFees) {
      feeTypes = [{ tokenId, symbol }];
      actived = tokenId;
    }
    await dispatch(
      actionFetchedUserFees({
        userFeesData,
        feeTypes,
        actived,
      }),
    );
  }
};

export const actionToggleFastFee = (payload) => ({
  type: ACTION_TOGGLE_FAST_FEE,
  payload,
});
