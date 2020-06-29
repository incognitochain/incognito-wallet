import {ActivityIndicator, View, Text, Button, TouchableOpacity} from '@src/components/core';
import LoadingTx from '@src/components/LoadingTx';
import PropTypes from 'prop-types';
import React from 'react';
import BaseScreen from '@src/screens/BaseScreen';
import {CONSTANT_COMMONS} from '@src/constants';
import theme from '@src/styles/theme';
import formatUtils from '@src/utils/format';
import convert from '@src/utils/convert';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '@src/styles';
import styles from './styles';

const pDecimals = CONSTANT_COMMONS.DECIMALS.MAIN_CRYPTO_CURRENCY;
const symbol = CONSTANT_COMMONS.CRYPTO_SYMBOL.PRV;

class AddStake extends BaseScreen {
  constructor(props) {
    super(props);
    this.state = {
      blockStatus1: false,
      blockStatus2: false
    };
  }
  renderStake() {
    const { amount, onStake } = this.props;
    const formatAmount = convert.toHumanAmount(amount, pDecimals) + ' ' + symbol;
    return (
      <View>
        <Button style={[styles.button, theme.BUTTON.BLACK_TYPE]} title={`Stake ${formatAmount}`} onPress={onStake} />
      </View>
    );
  }

  renderBuy() {
    const { amount, onBuy, fee } = this.props;
    const formatAmount = formatUtils.amount(amount, pDecimals);
    return (
      <View style={styles.buy}>
        <Text style={[styles.desc, styles.firstLine]}>You need {formatAmount} PRV + {formatUtils.amount(fee, pDecimals)} {symbol} to stake this node.</Text>
        <Text style={styles.desc}>Please make sure you also have enough to cover the network fee.</Text>
        <Button style={[styles.button, theme.BUTTON.BLACK_TYPE]} title="Buy PRV" onPress={onBuy} />
      </View>
    );
  }
  renderStatusStakeOwnFund = (text, onPress, shouldDropDown) => {
    return (
      <View style={[styles.balanceContainer, theme.MARGIN.marginTopDefault, { flexDirection: 'row', justifyContent: 'space-between' }]}>
        <Text style={[theme.text.boldTextStyleMedium]}>{text}</Text>
        <TouchableOpacity
          style={[{ flexDirection: 'row' }, styles.balanceContainer]}
          onPress={onPress}
        >
          <Ionicons name={shouldDropDown ? 'ios-arrow-up' : 'ios-arrow-down'} size={25} color={COLORS.colorGreyBold} />
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    const {
      fee,
      balance,
      isStaking,
      amount,
      account,
    } = this.props;
    const {blockStatus1, blockStatus2} = this.state;

    if (amount === undefined || balance === undefined || fee === undefined) {
      return <ActivityIndicator size="small" />;
    }

    const isNotEnoughBalance = !balance || fee + amount > balance;

    return (
      <View style={styles.card}>
        {this.renderStatusStakeOwnFund('Stake with your own funds', ()=>this.setState({blockStatus1: !blockStatus1}), blockStatus1)}
        {blockStatus1 && (
          <View style={{marginTop: 20, marginBottom: 20}}>
            <Text style={styles.title}>Account {account.AccountName}</Text>
            <View style={styles.row}>
              <Text style={styles.field}>Balance:</Text>
              <Text style={styles.itemRight}>{formatUtils.amount(balance, pDecimals)} {symbol}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.field}>Fee</Text>
              <Text style={styles.itemRight}>{formatUtils.amount(fee, pDecimals)} {symbol}</Text>
            </View>
            {isNotEnoughBalance ? this.renderBuy() : this.renderStake()}
          </View>
        )}
        
        {this.renderStatusStakeOwnFund('Rent the required stake', ()=>this.setState({blockStatus2: !blockStatus2}), blockStatus2)}
        {blockStatus2 && 
        <Text style={[theme.text.regularTextMotto, theme.MARGIN.marginRightDefault]}>Contact go@incognito.org to stake this Node with rented funds</Text> } 
        { isStaking && <LoadingTx /> }
      </View>
    );
  }
}

AddStake.propTypes = {
  account: PropTypes.object.isRequired,
  onStake: PropTypes.func.isRequired,
  onSelectFee: PropTypes.func.isRequired,
  isStaking: PropTypes.bool.isRequired,
  token: PropTypes.object.isRequired,
  amount: PropTypes.number,
  fee: PropTypes.number,
  balance: PropTypes.number,
  estimateFeeData: PropTypes.object,
};

export default AddStake;
