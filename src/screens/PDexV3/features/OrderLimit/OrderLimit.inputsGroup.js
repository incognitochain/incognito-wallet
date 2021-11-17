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
import convert from '@src/utils/convert';
import {
  TAB_BUY_LIMIT_ID,
  TAB_SELL_LIMIT_ID,
} from '@screens/PDexV3/features/Trade/Trade.constant';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { findPoolByPairSelector } from '@screens/PDexV3/features/Pools';
import SelectPercentAmount from '@src/components/SelectPercentAmount';
import { Divider } from '@src/components/core';
import {
  maxAmountValidatorForBuyInput,
  maxAmountValidatorForSellInput,
} from './OrderLimit.utils';
import {
  inputAmountSelector,
  orderLimitDataSelector,
  rateDataSelector,
  sellInputAmountSelector,
  selectableTokens1Selector,
  selectableTokens2Selector,
  poolSelectedDataSelector,
} from './OrderLimit.selector';
import { formConfigs } from './OrderLimit.constant';
import {
  actionInit,
  actionSetPoolSelected,
  actionResetOrdersHistory,
  actionSetPercent,
} from './OrderLimit.actions';

const styled = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 24,
  },
  inputContainer: {},
  selectPercentAmountContainer: {
    marginTop: 40,
    marginBottom: 0,
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
  dividerStyled: {
    marginVertical: 16,
  },
});

const RateInput = React.memo(() => {
  const navigation = useNavigation();
  const poolSelected = useSelector(poolSelectedDataSelector);
  const dispatch = useDispatch();
  const orderlimitData = useSelector(orderLimitDataSelector);
  const rateData = useSelector(rateDataSelector);
  const rateToken: SelectedPrivacy = rateData?.rateToken;
  const { activedTab } = orderlimitData;
  const selectableTokens = useSelector(selectableTokens2Selector);
  const findPoolByPair = useSelector(findPoolByPairSelector);
  const onPressSymbol = () => {
    navigation.navigate(routeNames.SelectTokenModal, {
      data: selectableTokens,
      onPress: (token2: SelectedPrivacy) => {
        const token1: SelectedPrivacy = poolSelected?.token1 || {};
        const pool = findPoolByPair({
          token1Id: token1?.tokenId,
          token2Id: token2?.tokenId,
        });
        if (pool?.poolId) {
          batch(() => {
            dispatch(actionResetOrdersHistory());
            dispatch(actionSetPoolSelected(pool?.poolId));
            dispatch(actionInit(true));
          });
        }
      },
    });
  };
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
        canSelectSymbol
        onPressSymbol={onPressSymbol}
      />
    </View>
  );
});

const SellInput = React.memo(() => {
  const navigation = useNavigation();
  const orderLimitData = useSelector(orderLimitDataSelector);
  const rateData = useSelector(rateDataSelector);
  const { rateToken } = rateData;
  const dispatch = useDispatch();
  const inputAmount = useSelector(inputAmountSelector);
  const sellInputAmount = inputAmount(formConfigs.selltoken);
  const sellToken: SelectedPrivacy = sellInputAmount?.tokenData;
  const selectableTokens = useSelector(selectableTokens1Selector);
  const findPoolByPair = useSelector(findPoolByPairSelector);
  const onPressSymbol = () => {
    const { activedTab } = orderLimitData;
    switch (activedTab) {
    case TAB_BUY_LIMIT_ID: {
      break;
    }
    case TAB_SELL_LIMIT_ID: {
      navigation.navigate(routeNames.SelectTokenModal, {
        data: selectableTokens,
        onPress: (sellToken: SelectedPrivacy) => {
          const pool = findPoolByPair({
            token1Id: sellToken?.tokenId,
            token2Id: rateToken?.tokenId,
          });
          if (pool?.poolId) {
            batch(() => {
              dispatch(actionResetOrdersHistory());
              dispatch(actionSetPoolSelected(pool?.poolId));
              dispatch(actionInit(true));
            });
          }
        },
      });
      break;
    }
    default:
      break;
    }
  };
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
      dispatch(actionSetPercent(0));
    });
  };
  const onChange = (sellAmount) => {
    try {
      batch(() => {
        dispatch(
          change(formConfigs.formName, formConfigs.selltoken, sellAmount),
        );
        dispatch(actionSetPercent(0));
        if (typeof validator.number()(sellAmount) !== 'undefined') {
          dispatch(change(formConfigs.formName, formConfigs.selltoken, ''));
          return;
        }
      });
    } catch (error) {
      console.log('BuyInput-onChange-error', error);
    }
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
        canSelectSymbol
        onPressSymbol={onPressSymbol}
        onChange={onChange}
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
  const { customRate, rateToken } = rateData;
  const selectableTokens = useSelector(selectableTokens1Selector);
  const findPoolByPair = useSelector(findPoolByPairSelector);
  const onPressSymbol = () => {
    const { activedTab } = orderLimitData;
    switch (activedTab) {
    case TAB_BUY_LIMIT_ID: {
      navigation.navigate(routeNames.SelectTokenModal, {
        data: selectableTokens,
        onPress: (buyToken: SelectedPrivacy) => {
          const pool = findPoolByPair({
            token1Id: buyToken?.tokenId,
            token2Id: rateToken?.tokenId,
          });
          if (pool?.poolId) {
            batch(() => {
              dispatch(actionResetOrdersHistory());
              dispatch(actionSetPoolSelected(pool?.poolId));
              dispatch(actionInit(true));
            });
          }
        },
      });
      break;
    }
    case TAB_SELL_LIMIT_ID: {
      break;
    }
    default:
      break;
    }
  };
  const onChange = (buyAmount) => {
    try {
      batch(() => {
        dispatch(change(formConfigs.formName, formConfigs.buytoken, buyAmount));
        dispatch(actionSetPercent(0));
        if (typeof validator.number()(buyAmount) !== 'undefined') {
          dispatch(change(formConfigs.formName, formConfigs.buytoken, ''));
          return;
        }
      });
    } catch (error) {
      console.log('BuyInput-onChange-error', error);
    }
  };
  const onPressInfinityIcon = async () => {
    const {
      availableAmountNumber: availableSellAmountNumber,
    } = sellInputAmount;
    let buyAmountNumber = new BigNumber(availableSellAmountNumber)
      .dividedBy(customRate)
      .toNumber();
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
      dispatch(actionSetPercent(0));
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
        onPressInfinityIcon={onPressInfinityIcon}
        canSelectSymbol
        onPressSymbol={onPressSymbol}
        onChange={onChange}
      />
    </View>
  );
});

const SelectPercentAmountInput = React.memo(() => {
  const dispatch = useDispatch();
  const inputAmount = useSelector(inputAmountSelector);
  const sellInputAmount = inputAmount(formConfigs.selltoken);
  const buyInputAmount = inputAmount(formConfigs.buytoken);
  const buyToken: SelectedPrivacy = buyInputAmount?.tokenData;
  const sellToken: SelectedPrivacy = sellInputAmount?.tokenData;
  const { customRate } = useSelector(rateDataSelector);
  const { mainColor, percent: selected, activedTab } = useSelector(
    orderLimitDataSelector,
  );
  const onPressPercent = (percent) => {
    let _percent;
    if (percent === selected) {
      _percent = 0;
      dispatch(actionSetPercent(0));
    } else {
      _percent = percent;
      dispatch(actionSetPercent(percent));
    }
    _percent = _percent / 100;
    switch (activedTab) {
    case TAB_BUY_LIMIT_ID: {
      const {
        availableAmountNumber: availableSellAmountNumber,
      } = sellInputAmount;
      let buyAmountNumber = new BigNumber(availableSellAmountNumber)
        .dividedBy(customRate)
        .multipliedBy(_percent)
        .toNumber();
      let originalBuyAmount = convert.toOriginalAmount(
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
      dispatch(
        change(
          formConfigs.formName,
          formConfigs.buytoken,
          availableBuyAmountText,
        ),
      );
      dispatch(focus(formConfigs.formName, formConfigs.buytoken));
      break;
    }
    case TAB_SELL_LIMIT_ID: {
      const {
        availableAmountNumber: availableSellAmountNumber,
      } = sellInputAmount;
      let sellAmountNumber = new BigNumber(availableSellAmountNumber)
        .multipliedBy(_percent)
        .toNumber();
      const availableSellAmountText = format.toFixed(
        sellAmountNumber,
          sellToken?.pDecimals,
      );
      dispatch(
        change(
          formConfigs.formName,
          formConfigs.selltoken,
          availableSellAmountText,
        ),
      );
      dispatch(focus(formConfigs.formName, formConfigs.selltoken));
      break;
    }
    default:
      break;
    }
  };
  return (
    <SelectPercentAmount
      size={4}
      containerStyled={styled.selectPercentAmountContainer}
      percentBtnColor={mainColor}
      selected={selected}
      onPressPercent={onPressPercent}
    />
  );
});

const InputsGroup = React.memo(() => {
  const { activedTab } = useSelector(orderLimitDataSelector);
  const poolSelected = useSelector(poolSelectedDataSelector);
  const renderMain = () => {
    switch (activedTab) {
    case TAB_SELL_LIMIT_ID: {
      return (
        <>
          <RateInput />
          <Divider dividerStyled={styled.dividerStyled} />
          <SellInput />
          <SelectPercentAmountInput />
        </>
      );
    }
    case TAB_BUY_LIMIT_ID: {
      return (
        <>
          <RateInput />
          <Divider dividerStyled={styled.dividerStyled} />
          <BuyInput />
          <SelectPercentAmountInput />
        </>
      );
    }
    default:
      return null;
    }
  };
  if (!poolSelected) {
    return null;
  }
  return <View style={styled.container}>{renderMain()}</View>;
});

export default InputsGroup;
