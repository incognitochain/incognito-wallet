import React from 'react';
import PropTypes from 'prop-types';
import { Button, Text, View } from '@components/core';
import formatUtils from '@utils/format';
import LoadingTx from '@components/LoadingTx/LoadingTx';
import { CONSTANT_COMMONS } from '@src/constants';
import { MESSAGES } from '@screens/Dex/constants';
import Header from '@src/components/Header';
import theme from '@src/styles/theme';
import styles from '../styles';

const pDecimals = CONSTANT_COMMONS.DECIMALS.MAIN_CRYPTO_CURRENCY;
const symbol = CONSTANT_COMMONS.CRYPTO_SYMBOL.PRV;

const Unstake = ({ device, fee, isUnstaking, balance, onUnstake }) => {
  const account = device.Account;
  const name = device.Name;
  const isNotEnoughBalance = fee > balance;
  return (
    <View style={styles.container}>
      <Header title="Unstake" />
      <View style={[theme.MARGIN.marginTopAvg]}>
        <Text style={styles.title}>Node {name}</Text>
        <Text style={styles.title}>Account {account.AccountName}</Text>
        <View style={styles.row}>
          <Text style={styles.field}>Balance:</Text>
          <Text style={styles.itemRight}>{formatUtils.amount(balance, pDecimals)} {symbol}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.field}>Fee</Text>
          <Text style={styles.itemRight}>{formatUtils.amount(fee, pDecimals)} {symbol}</Text>
        </View>
      </View>
      <View style={styles.buy}>
        <Text style={[styles.desc, styles.firstLine]}>{isUnstaking ? 'Unstaking may take up to 21 days. This Node will unstake the next time it is selected to earn.' : 'The unstaking process will complete the next time your Node is selected to work. This may take up to 21 days'}</Text>
        <Text style={styles.desc}>{isUnstaking ? '' : 'Are you sure you want to unstake this Node?'}</Text>
        <Button disabled={isNotEnoughBalance} style={[styles.button, theme.BUTTON.BLACK_TYPE]} title={isUnstaking ? 'Unstaking in process' : 'Unstake'} onPress={onUnstake} />
        {isNotEnoughBalance && <Text style={styles.error}>{MESSAGES.NOT_ENOUGH_NETWORK_FEE_ADD}</Text>}
      </View>
      {isUnstaking && <LoadingTx />}
    </View>
  );
};

Unstake.propTypes = {
  device: PropTypes.object.isRequired,
  fee: PropTypes.number.isRequired,
  isUnstaking: PropTypes.bool.isRequired,
  balance: PropTypes.number.isRequired,
  onUnstake: PropTypes.func.isRequired,
};

Unstake.defaultProps = {};

export default Unstake;
