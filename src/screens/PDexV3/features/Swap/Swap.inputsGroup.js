import {
  RFTradeInputAmount as TradeInputAmount,
  validator,
} from '@components/core/reduxForm';
import { SwapButton } from '@src/components/core';
import ToggleArrow from '@src/components/ToggleArrow';
import SelectedPrivacy from '@src/models/selectedPrivacy';
import routeNames from '@src/router/routeNames';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import { useDispatch, useSelector } from 'react-redux';
import { change, Field } from 'redux-form';
import { throttle } from 'lodash';
import {InterSwapMsg} from '@screens/PDexV3/features/Swap/Swap.simpleTab';
import { getPrivacyPRVInfo } from '@src/redux/selectors/selectedPrivacy';
import { formConfigs } from './Swap.constant';
import SwapDetails from './Swap.details';
import { maxAmountValidatorForSellInput, maxAmountValidatorForPRVSellInput } from './Swap.utils';
import FeeError from './Swap.feeError';

import {
  selltokenSelector,
  buytokenSelector,
  swapSelector,
  inputAmountSelector,
  swapInfoSelector,
  platformSelectedSelector,
  feetokenDataSelector,
  getTotalFeePRVSelector
} from './Swap.selector';
import {
  actionEstimateTrade,
  actionGetMaxAmount,
  actionResetData,
  actionSelectToken,
  actionSetFocusToken,
  actionSwapToken,
  actionToggleProTab,
  actionNavigateToSelectToken,
} from './Swap.actions';
import SwapProTab from './Swap.proTab';
import { inputGroupStyled as styled } from './Swap.styled';

const SwapInputsGroup = React.memo(() => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const swapInfo = useSelector(swapInfoSelector);
  const swap = useSelector(swapSelector);
  const selltoken: SelectedPrivacy = useSelector(selltokenSelector);
  const buytoken: SelectedPrivacy = useSelector(buytokenSelector);
  const feetokenData: SelectedPrivacy = useSelector(feetokenDataSelector);
  const privacyPRVInfo: SelectedPrivacy = useSelector(getPrivacyPRVInfo);
  const totalFeePRV: SelectedPrivacy = useSelector(getTotalFeePRVSelector);

  const platform = useSelector(platformSelectedSelector);
  const inputAmount = useSelector(inputAmountSelector);
  const sellInputAmount = inputAmount(formConfigs.selltoken);
  const buyInputAmount = inputAmount(formConfigs.buytoken);

  const onSelectToken = async (token, field) => {
    dispatch(actionSelectToken(token, field));
  };

  const onSelectSellToken = () => {
    dispatch(actionNavigateToSelectToken(true));
    navigation.navigate(routeNames.SelectTokenScreen, {
      data: {
        from: 'sellToken',
        tokenId: selltoken.tokenId,
      },
      onPress: (token) => onSelectToken(token, formConfigs.selltoken),
    });
  };

  const onSelectBuyToken = () => {
    dispatch(actionNavigateToSelectToken(true));
    navigation.navigate(routeNames.SelectTokenScreen, {
      data: {
        from: 'buyToken',
        tokenId: buytoken.tokenId,
      },
      onPress: (token) => onSelectToken(token, formConfigs.buytoken),
    });
  };

  const onFocusToken = (e, field) => dispatch(actionSetFocusToken(swap[field]));
  const onEndEditing = (field) => dispatch(actionEstimateTrade({ field }));
  const onSwapButtons = () => {
    // if (selltoken?.movedUnifiedToken) {
    //   return;
    // }
    dispatch(actionSwapToken());
    dispatch(actionResetData());
    dispatch(change(formConfigs.formName, formConfigs.feetoken, ''));
  };

  let _maxAmountValidatorForSellInput = React.useCallback(
    (inputValue) =>
      maxAmountValidatorForSellInput(
        sellInputAmount,
        buyInputAmount,
        feetokenData,
        navigation,
        swapInfo,
        inputValue,
        privacyPRVInfo
      ),
    [
      sellInputAmount?.originalAmount,
      sellInputAmount?.availableOriginalAmount,
      sellInputAmount?.availableAmountText,
      sellInputAmount?.symbol,
      feetokenData?.minFeeOriginalToken,
      feetokenData?.minFeeOriginal,
      navigation,
      buyInputAmount?.originalAmount,
      buyInputAmount?.availableOriginalAmount,
      privacyPRVInfo
    ],
  );

  const onPressInfinityIcon = useCallback(
    throttle(
      async () => {
        const { availableAmountText, maxAmount } = await dispatch(
          actionGetMaxAmount(),
        );
        dispatch(change(formConfigs.formName, formConfigs.feetoken, ''));
        dispatch(change(formConfigs.formName, formConfigs.buytoken, ''));

        await dispatch(
          change(
            formConfigs.formName,
            formConfigs.selltoken,
            availableAmountText,
          ),
        );
        if (maxAmount > 0) {
          dispatch(
            actionEstimateTrade({ field: formConfigs.selltoken, useMax: true }),
          );
        } else {
          dispatch(actionResetData());
        }
      },
      3500,
      {
        leading: true,
        trailing: false,
      },
    ),
    [],
  );

  let _maxAmountValidatorForPRVSellInput = React.useCallback(
    (inputValue) =>
      maxAmountValidatorForPRVSellInput(
        sellInputAmount,
        buyInputAmount,
        feetokenData,
        navigation,
        swapInfo,
        inputValue,
        privacyPRVInfo,
        totalFeePRV
      ),
    [
      sellInputAmount?.originalAmount,
      sellInputAmount?.availableOriginalAmount,
      sellInputAmount?.availableAmountText,
      sellInputAmount?.symbol,
      feetokenData?.minFeeOriginalToken,
      feetokenData?.minFeeOriginal,
      navigation,
      buyInputAmount?.originalAmount,
      buyInputAmount?.availableOriginalAmount,
      privacyPRVInfo,
      totalFeePRV
    ],
  );

  const onChange = (field, value) => {
    dispatch(change(formConfigs.formName, field, value));
    switch (field) {
      case formConfigs.selltoken:
        dispatch(change(formConfigs.formName, formConfigs.buytoken, ''));
        break;
      case formConfigs.buytoken:
        dispatch(change(formConfigs.formName, formConfigs.selltoken, ''));
        break;
      default:
        break;
    }
  };
  return (
    <View style={styled.inputGroups}>
      <Field
        component={TradeInputAmount}
        name={formConfigs.selltoken}
        hasInfinityIcon
        canSelectSymbol
        symbol={selltoken?.symbol}
        onChange={(value) => onChange(formConfigs.selltoken, value)}
        onPressSymbol={onSelectSellToken}
        onFocus={(e) => onFocusToken(e, formConfigs.selltoken)}
        onEndEditing={() => onEndEditing(formConfigs.selltoken)}
        onPressInfinityIcon={onPressInfinityIcon}
        validate={[
          ...(selltoken.isIncognitoToken
            ? validator.combinedNanoAmount
            : validator.combinedAmount),
          _maxAmountValidatorForPRVSellInput,
          _maxAmountValidatorForSellInput,
        ]}
        loadingBalance={!!sellInputAmount?.loadingBalance}
        editableInput={!!swapInfo?.editableInput}
      />
      <SwapButton onSwapButtons={onSwapButtons} />
      <Field
        component={TradeInputAmount}
        name={formConfigs.buytoken}
        canSelectSymbol
        symbol={buytoken?.symbol}
        onPressSymbol={onSelectBuyToken}
        onFocus={(e) => onFocusToken(e, formConfigs.buytoken)}
        // onEndEditing={() => onEndEditing(formConfigs.buytoken)}
        onEndEditing={() => onEndEditing(formConfigs.selltoken)}
        validate={[...validator.combinedAmount]}
        loadingBalance={!!buyInputAmount?.loadingBalance}
        editableInput={false}
        visibleHeader={false}
        onChange={(value) => onChange(formConfigs.buytoken, value)}
      />
      <InterSwapMsg />
      <ToggleArrow
        label="Advanced"
        toggle={swapInfo?.toggleProTab}
        handlePressToggle={() =>
          dispatch(actionToggleProTab(!swapInfo?.toggleProTab))
        }
        style={styled.toggleArrow}
      />
      <SwapProTab />
      <SwapDetails />
      <FeeError />
    </View>
  );
});

export default SwapInputsGroup;
