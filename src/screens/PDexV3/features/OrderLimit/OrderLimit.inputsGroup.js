import React from 'react';
import { FONT, COLORS } from '@src/styles';
import { View, StyleSheet } from 'react-native';
import { Row } from '@src/components';
import {
  RFTradeInputAmount as TradeInputAmount,
  validator,
} from '@components/core/reduxForm';
import SelectedPrivacy from '@src/models/selectedPrivacy';
import { change, Field, focus } from 'redux-form';
import { batch, useDispatch, useSelector } from 'react-redux';
import format from '@src/utils/format';
import BigNumber from 'bignumber.js';
import { ButtonChart } from '@src/components/Button';
import convert from '@src/utils/convert';
import {
  TAB_BUY_LIMIT_ID,
  TAB_SELL_LIMIT_ID,
} from '@screens/PDexV3/features/Trade/Trade.constant';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import {
  maxAmountValidatorForBuyInput,
  maxAmountValidatorForSellInput,
} from './OrderLimit.utils';
import {
  inputAmountSelector,
  orderLimitDataSelector,
  rateDataSelector,
  sellInputAmountSelector,
} from './OrderLimit.selector';
import { actionSetPercent } from './OrderLimit.actions';
import { formConfigs } from './OrderLimit.constant';

const styled = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  selectPercentAmountContainer: {
    marginBottom: 24,
  },
  balanceWrapper: {
    justifyContent: 'space-between',
  },
  balanceLabel: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.superSmall,
    color: COLORS.colorGrey3,
  },
  balanceValue: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.superSmall,
    color: COLORS.black,
  },
});

const RateInput = React.memo(() => {
  const dispatch = useDispatch();
  const orderlimitData = useSelector(orderLimitDataSelector);
  const rateData = useSelector(rateDataSelector);
  const rateToken: SelectedPrivacy = rateData?.rateToken;
  const { activedTab } = orderlimitData;
  const onChange = async (rate) => {
    try {
      dispatch(change(formConfigs.formName, formConfigs.rate, rate));
      if (typeof validator.number()(rate) !== 'undefined') {
        switch (activedTab) {
        case TAB_BUY_LIMIT_ID: {
          dispatch(change(formConfigs.formName, formConfigs.buytoken, ''));
          break;
        }
        case TAB_SELL_LIMIT_ID: {
          dispatch(change(formConfigs.formName, formConfigs.selltoken, ''));
          break;
        }
        default:
          break;
        }
        return;
      }
    } catch (error) {
      console.log('onChange-error', error);
    }
  };
  return (
    <View style={styled.inputContainer}>
      <Field
        component={TradeInputAmount}
        name={formConfigs.rate}
        keyboardType="decimal-pad"
        placeholder="0"
        ellipsizeMode="tail"
        numberOfLines={1}
        onChange={onChange}
        validate={[
          ...(rateToken?.isIncognitoToken
            ? validator.combinedNanoAmount
            : validator.combinedAmount),
        ]}
        editableInput={!!orderlimitData?.editableInput}
        symbol={rateToken?.symbol}
        label="Limit price"
        visibleHeader
      />
    </View>
  );
});

const SellInput = React.memo(() => {
  const navigation = useNavigation();
  const orderLimitData = useSelector(orderLimitDataSelector);
  const dispatch = useDispatch();
  const inputAmount = useSelector(inputAmountSelector);
  const sellInputAmount = inputAmount(formConfigs.selltoken);
  const sellToken: SelectedPrivacy = sellInputAmount?.tokenData;
  const onPressInfinityIcon = async () => {
    batch(() => {
      dispatch(
        change(
          formConfigs.formName,
          formConfigs.selltoken,
          sellInputAmount?.availableAmountText,
        ),
      );
      dispatch(focus(formConfigs.formName, formConfigs.selltoken));
    });
  };
  let _maxAmountValidatorForSellInput = React.useCallback(
    () => maxAmountValidatorForSellInput(sellInputAmount),
    [
      sellInputAmount?.originalAmount,
      sellInputAmount?.availableOriginalAmount,
      sellInputAmount?.availableAmountText,
      sellInputAmount?.symbol,
    ],
  );
  if (!sellInputAmount) {
    return null;
  }
  return (
    <View style={styled.inputContainer}>
      <Field
        component={TradeInputAmount}
        name={formConfigs.selltoken} //
        hasInfinityIcon
        symbol={sellInputAmount?.symbol}
        srcIcon={sellInputAmount?.iconUrl}
        onPressInfinityIcon={onPressInfinityIcon}
        validate={[
          ...(sellToken?.isIncognitoToken
            ? validator.combinedNanoAmount
            : validator.combinedAmount),
          _maxAmountValidatorForSellInput,
        ]}
        loadingBalance={!!sellInputAmount?.loadingBalance}
        editableInput={!!orderLimitData?.editableInput}
        visibleHeader
        label="Amount"
        rightHeader={
          <ButtonChart onPress={() => navigation.navigate(routeNames.Chart)} />
        }
      />
    </View>
  );
});

const BuyInput = React.memo(() => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const inputAmount = useSelector(inputAmountSelector);
  const buyInputAmount = inputAmount(formConfigs.buytoken);
  const sellInputAmount = useSelector(sellInputAmountSelector);
  const buyToken: SelectedPrivacy = buyInputAmount?.tokenData;
  const sellToken: SelectedPrivacy = sellInputAmount?.tokenData;
  const orderLimitData = useSelector(orderLimitDataSelector);
  const rateData = useSelector(rateDataSelector);
  const { customRate } = rateData;
  const onPressInfinityIcon = async () => {
    const {
      availableAmountNumber: availableSellAmountNumber,
    } = sellInputAmount;
    let buyAmountNumber = new BigNumber(availableSellAmountNumber).dividedBy(
      customRate,
    );
    const originalBuyAmount = convert.toOriginalAmount(
      buyAmountNumber,
      buyToken?.pDecimals,
    );
    buyAmountNumber = convert.toHumanAmount(
      originalBuyAmount,
      buyToken?.pDecimals,
    );
    const availableBuyAmountText = format.toFixed(
      buyAmountNumber,
      buyToken?.pDecimals,
    );
    batch(() => {
      dispatch(
        change(
          formConfigs.formName,
          formConfigs.buytoken,
          availableBuyAmountText,
        ),
      );
      dispatch(focus(formConfigs.formName, formConfigs.buytoken));
    });
  };
  let _maxAmountValidatorForBuyInput = React.useCallback(
    () =>
      maxAmountValidatorForBuyInput({
        buyToken,
        sellInputAmount,
        customRate,
        sellToken,
        buyOriginalAmount: buyInputAmount?.originalAmount,
      }),
    [
      buyToken?.symbol,
      buyToken?.pDecimals,
      customRate,
      sellToken?.symbol,
      buyInputAmount?.originalAmount,
      sellInputAmount?.availableAmountNumber,
      sellInputAmount?.availableOriginalAmount,
    ],
  );
  if (!buyInputAmount) {
    return null;
  }
  return (
    <View style={styled.inputContainer}>
      <Field
        component={TradeInputAmount}
        name={formConfigs.buytoken} //
        symbol={buyInputAmount?.symbol}
        validate={[
          ...(buyToken?.isIncognitoToken
            ? validator.combinedNanoAmount
            : validator.combinedAmount),
          _maxAmountValidatorForBuyInput,
        ]}
        loadingBalance={!!buyInputAmount?.loadingBalance}
        editableInput={!!orderLimitData?.editableInput}
        visibleHeader
        label="Amount"
        hasInfinityIcon
        onPressInfinityIcon={onPressInfinityIcon}
        rightHeader={
          <ButtonChart onPress={() => navigation.navigate(routeNames.Chart)} />
        }
      />
    </View>
  );
});

const InputsGroup = React.memo(() => {
  const { activedTab } = useSelector(orderLimitDataSelector);
  const renderMain = () => {
    switch (activedTab) {
    case TAB_SELL_LIMIT_ID: {
      return (
        <>
          <SellInput />
          <RateInput />
        </>
      );
    }
    case TAB_BUY_LIMIT_ID: {
      return (
        <>
          <BuyInput />
          <RateInput />
        </>
      );
    }
    default:
      return null;
    }
  };
  return <View style={styled.container}>{renderMain()}</View>;
});

export default InputsGroup;
