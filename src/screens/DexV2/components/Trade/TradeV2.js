import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import {
  View,
  RefreshControl,
  Text,
  RoundCornerButton,
  TouchableOpacity,
} from '@components/core';
import withAccount from '@screens/DexV2/components/account.enhance';
import {
  withInput,
  withOutput,
  withData,
  withPair,
  withFee,
  withBalanceLoader,
  withSwap,
  withSegment,
  withRetryTradeInfo,
  withValidate,
} from '@screens/DexV2/components/Trade/withHoc';
import SwapToken from '@screens/DexV2/components/Trade/Components/SwapToken/SwapToken';
import { useNavigation } from 'react-navigation-hooks';
import ROUTE_NAMES from '@routers/routeNames';
import SegmentControl from '@components/SegmentControl';
import TradeInfoSimple from '@screens/DexV2/components/Trade/Components/TradeInfoSimple/TradeInfoSimple';
import TradeInfoPro from '@screens/DexV2/components/Trade/Components/TradeInfoPro/TradeInfoPro';
import { ArrowRightGreyIcon } from '@components/Icons';
import { TradeInputAmount } from '@screens/DexV2/components/Trade/Components/TradeInputAmountEditor';
import { TRADE_LOADING_VALUE } from '@screens/DexV2/components/Trade/TradeV2/Trade.appConstant';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import BtnRetryGrey from '@components/Button/BtnRetryGrey';
import withParams from '@screens/DexV2/components/Trade/params.enhance';
import withHistory from '@screens/DexV2/components/Trade/history.enhance';
import styles from './style';

const Trade = (props) => {
  const {
    pairTokens,
    inputToken,
    inputValue,
    inputText,
    onChangeInputToken,
    onChangeInputText,
    onSwapTokens,
    onChangeOutputToken,
    onChangeOutputText,
    outputList,
    outputToken,
    outputText,
    outputValue,
    minimumAmount,
    inputBalance,
    prvBalance,
    fee,
    feeToken,
    pair,
    histories,
    error,
    errorSlippage,
    quote,
    loadingBox,
    isErc20,
    isLoading,
    onLoadPairs,
    inputBalanceText,
    isSimple,
    segmentIndex,
    onChangeSegment,
    onRetryTradeInfo,
    disableButton,
    loadHistories,
  } = props;

  const navigation = useNavigation();
  const navigateTradeConfirm = () => {
    navigation.navigate(ROUTE_NAMES.TradeConfirm, {
      inputToken,
      inputValue,
      inputText,
      outputToken,
      outputValue,
      minimumAmount,
      fee,
      feeToken,
      pair,
      isErc20,
      inputBalance,
      prvBalance,
      quote,

      // Reload new rate after trading successfully
      onTradeSuccess: () => {
        if (typeof onLoadPairs === 'function') onLoadPairs();
        if (typeof loadHistories === 'function') loadHistories();
      }
    });
  };

  const navigateHistory = () => {
    navigation.navigate(ROUTE_NAMES.TradeHistory);
  };

  const renderContent = () => (
    <View style={styles.wrapper}>
      <TradeInputAmount
        tokens={pairTokens}
        onSelectToken={onChangeInputToken}
        onChange={onChangeInputText}
        token={inputToken}
        value={inputText}
        disabled={disableButton.disableInput}
        disableChooseToken={disableButton.disableInput || disableButton.disableOutput}
        loading={inputBalance === null || (loadingBox && loadingBox === TRADE_LOADING_VALUE.INPUT)}
        placeholder="0"
        maxValue={inputBalanceText}
      />
      <Text style={styles.error}>{error}</Text>
      <SwapToken onSwapTokens={onSwapTokens} />
      <TradeInputAmount
        tokens={outputList}
        onSelectToken={onChangeOutputToken}
        onChange={onChangeOutputText}
        token={outputToken}
        value={minimumAmount < 0 ? '0': outputText}
        disabled={disableButton.disableOutput}
        disableChooseToken={disableButton.disableInput || disableButton.disableOutput}
        loading={loadingBox && loadingBox === TRADE_LOADING_VALUE.OUTPUT}
        placeholder="0"
      />
      <RoundCornerButton
        style={styles.button}
        title="Preview your order"
        disabled={
          !!error ||
          !!errorSlippage ||
          !inputBalance ||
          !inputValue ||
          !minimumAmount ||
          minimumAmount < 0 ||
          !inputText ||
          !!loadingBox
        }
        onPress={navigateTradeConfirm}
      />
      <View style={styles.wrapperSegment}>
        <SegmentControl
          values={['Simple', 'Pro']}
          selectedIndex={segmentIndex}
          onChange={onChangeSegment}
        />
        { !isSimple && (
          <BtnRetryGrey
            onPress={onRetryTradeInfo}
          />
        )}
      </View>
      <View style={styles.wrapperInfo}>
        { isSimple ? (
          <TradeInfoSimple
            showPriceImpact={false}
            inputBalance={inputBalance}
          />
        ) : (
          <TradeInfoPro
            inputBalance={inputBalance}
          />
        )}
      </View>
    </View>
  );

  const renderBottomView = useCallback(() => {
    if (histories && histories.length > 0) {
      return (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            onPress={navigateHistory}
            style={styles.bottomFloatBtn}
          >
            <Text style={styles.bottomText}>Order history</Text>
            <ArrowRightGreyIcon style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }, [histories]);

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={(
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onLoadPairs}
          />
        )}
        extraScrollHeight={50}
      >
        {renderContent()}
      </KeyboardAwareScrollView>
      {renderBottomView()}
    </View>
  );
};

Trade.propTypes = {
  pairTokens: PropTypes.array.isRequired,
  inputToken: PropTypes.object,
  inputValue: PropTypes.number,
  inputText: PropTypes.string,
  onChangeInputToken: PropTypes.func.isRequired,
  onChangeInputText: PropTypes.func.isRequired,
  onSwapTokens: PropTypes.func.isRequired,
  onChangeOutputToken: PropTypes.func.isRequired,
  onChangeOutputText: PropTypes.func.isRequired,
  outputList: PropTypes.array,
  outputToken: PropTypes.object,
  outputText: PropTypes.string,
  outputValue: PropTypes.number,
  minimumAmount: PropTypes.number,
  inputBalance: PropTypes.number,
  prvBalance: PropTypes.number,
  fee: PropTypes.number.isRequired,
  feeToken: PropTypes.object.isRequired,
  pair: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  histories: PropTypes.array,
  error: PropTypes.string,
  errorSlippage: PropTypes.string,
  loadingBox: PropTypes.bool,
  quote: PropTypes.object,
  isErc20: PropTypes.bool,
  inputBalanceText: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  onLoadPairs: PropTypes.func.isRequired,
  isSimple: PropTypes.bool,
  segmentIndex: PropTypes.number.isRequired,
  onChangeSegment: PropTypes.func.isRequired,
  onRetryTradeInfo: PropTypes.func.isRequired,
  disableButton: PropTypes.object,
  loadHistories: PropTypes.func.isRequired,
};

Trade.defaultProps = {
  inputToken: null,
  inputValue: null,
  inputText: '',
  outputList: [],
  outputToken: null,
  outputText: '',
  outputValue: null,
  minimumAmount: null,
  inputBalance: null,
  prvBalance: null,
  error: '',
  errorSlippage: '',
  pair: null,
  histories: null,
  loadingBox: null,
  quote: null,
  isErc20: false,
  inputBalanceText: '',
  isSimple: true,
  disableButton: {}
};

export default compose(
  withAccount,
  withHistory,
  withData,
  withInput,
  withOutput,
  withPair,
  withFee,
  withBalanceLoader,
  withValidate,
  withSwap,
  withSegment,
  withRetryTradeInfo,
  withParams
)(memo(Trade));
