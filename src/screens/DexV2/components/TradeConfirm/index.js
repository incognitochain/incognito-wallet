import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { View, Text, RoundCornerButton, ScrollView, FlexView } from '@components/core';
import Balance from '@screens/DexV2/components/Balance';
import ExtraInfo from '@screens/DexV2/components/ExtraInfo';
import format from '@utils/format';
import { withLayout_2 } from '@components/Layout';
import Header from '@components/Header/index';
import withWarning from '@screens/DexV2/components/Trade/warning.enhance';
import Loading from '@screens/DexV2/components/Loading';
import withAccount from '@screens/DexV2/components/account.enhance';
import Help from '@components/Help/index';
import { DEFI_TRADING_FEE } from '@components/EstimateFee/EstimateFee.utils';
import Powered from '@screens/DexV2/components/Powered';
import PoolSize from '@screens/DexV2/components/PoolSize';
import withSuccess from './success.enhance';
import withTrade from './trade.enhance';
import withData from './data.enhance';
import styles from './style';

const Trade = ({
  inputToken,
  inputValue,
  inputText,
  outputToken,
  minimumAmount,
  fee,
  feeToken,
  onTrade,

  trading,

  error,
  warning,
  isErc20,
  pair,
}) => {
  return (
    <FlexView>
      <Header title="Order preview" />
      <ScrollView paddingBottom>
        <View style={styles.mainInfo}>
          <Text style={styles.bigText}>Buy at least</Text>
          <Text style={styles.bigText} numberOfLines={3}>{format.amountFull(minimumAmount, outputToken.pDecimals)} {outputToken.symbol}</Text>
        </View>
        <ExtraInfo
          left="Pay with"
          right={`${inputText} ${inputToken.symbol}`}
          style={{ ...styles.extra, ...styles.bold }}
        />
        <Balance
          token={inputToken}
          balance={inputValue}
          title="Purchase"
          style={styles.extra}
        />
        { !isErc20 && (
        <>
          <ExtraInfo
            token={feeToken}
            left={(
              <View style={styles.row}>
                <Text style={styles.extra}>Network fee</Text>
                <Help title="Network fee" content="Network fees go to validators. There is no trading fee." />
              </View>
            )}
            right={`${format.amount(fee, feeToken.pDecimals)} ${feeToken.symbol}`}
            style={styles.extra}
          />
          <PoolSize outputToken={outputToken} inputToken={inputToken} pair={pair} />
        </>
        )}
        { !!isErc20 && (
        <>
          <ExtraInfo
            token={feeToken}
            left={(
              <View style={styles.row}>
                <Text style={styles.extra}>Network fee</Text>
                <Help title="Network fee" content="Network fees go to validators." />
              </View>
            )}
            right={`${format.amount(fee, feeToken.pDecimals)} ${feeToken.symbol}`}
            style={styles.extra}
          />
          <ExtraInfo
            token={feeToken}
            left={(
              <View style={styles.row}>
                <Text style={styles.extra}>Trading fee</Text>
                <Help title="Trading fee" content="This is a Kyber pool. You are trading anonymously on the Ethereum network which will incur trading fees. Incognito does not charge trading fees." />
              </View>
            )}
            right={`${format.amount(DEFI_TRADING_FEE, feeToken.pDecimals)} ${feeToken.symbol}`}
            style={styles.extra}
          />
        </>
        )}
        <Powered network={isErc20 ? 'Kyber' : 'Incognito'} />
        {!!warning && <ExtraInfo left={warning} right="" style={styles.warning} />}
        {!!error && <Text style={styles.error}>{error}</Text>}
        <RoundCornerButton
          style={styles.button}
          title="Confirm"
          onPress={onTrade}
          disabled={!!error}
        />
      </ScrollView>
      <Loading open={trading} />
    </FlexView>
  );
};

Trade.propTypes = {
  inputToken: PropTypes.object,
  inputValue: PropTypes.number,
  inputText: PropTypes.string,
  onTrade: PropTypes.func.isRequired,
  outputToken: PropTypes.object,
  minimumAmount: PropTypes.number,

  fee: PropTypes.number.isRequired,
  feeToken: PropTypes.object.isRequired,

  trading: PropTypes.bool.isRequired,

  error: PropTypes.string,
  warning: PropTypes.string,
  isErc20: PropTypes.bool,
  pair: PropTypes.object,
};

Trade.defaultProps = {
  inputToken: null,
  inputValue: null,
  inputText: '',
  outputToken: null,
  minimumAmount: null,
  error: '',
  warning: '',
  isErc20: false,
  pair: null,
};

export default compose(
  withLayout_2,
  withData,
  withSuccess,
  withAccount,
  withTrade,
  withWarning,
)(Trade);
