import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import {View, Text, RoundCornerButton, ScrollView, FlexView} from '@components/core';
import { withLayout_2 } from '@components/Layout';
import Header from '@components/Header/index';
import Loading from '@screens/DexV2/components/Loading';
import withDefaultAccount from '@components/Hoc/withDefaultAccount';
import mainStyles from '@screens/Dex/style';
import Balance from '@screens/DexV2/components/Balance';
import withDexAccounts from '@screens/Dex/dexAccount.enhance';
import PoolSize from '@screens/Dex/PoolSize';
import withSuccess from './success.enhance';
import withConfirm from './confirm.enhance';
import withData from './data.enhance';
import styles from './style';

const Confirm = ({
  firstCoin,
  secondCoin,
  fee,
  feeToken,
  onConfirm,
  processing,
  pair,
  error,
}) => {
  return (
    <FlexView>
      <Header title="Order preview" />
      <ScrollView paddingBottom>
        <View style={styles.mainInfo}>
          <Text style={styles.bigText}>Add</Text>
          <Text style={styles.bigText} numberOfLines={3}>{firstCoin.displayValue} {firstCoin.symbol} + {secondCoin.displayValue} {secondCoin.symbol}</Text>
        </View>
        <Balance
          token={feeToken}
          balance={fee}
          title="Fee"
          style={styles.extra}
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <RoundCornerButton
          style={[styles.button, mainStyles.button]}
          title="Add liquidity"
          onPress={onConfirm}
          disabled={!!error}
        />

        <Balance token={firstCoin} balance={firstCoin.balance} hideRightSymbol />
        <Balance token={secondCoin} balance={secondCoin.balance} hideRightSymbol />
        <PoolSize inputToken={firstCoin} outputToken={secondCoin} pair={pair} />
      </ScrollView>
      <Loading open={processing} />
    </FlexView>
  );
};

Confirm.propTypes = {
  firstCoin: PropTypes.object.isRequired,
  secondCoin: PropTypes.object.isRequired,
  pair: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  fee: PropTypes.number.isRequired,
  feeToken: PropTypes.object.isRequired,
  processing: PropTypes.bool.isRequired,
  error: PropTypes.string.isRequired,
};

export default compose(
  withLayout_2,
  withData,
  withSuccess,
  withDefaultAccount,
  withDexAccounts,
  withConfirm,
)(Confirm);
