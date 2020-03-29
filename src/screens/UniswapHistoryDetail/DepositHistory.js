import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {View, Text, Button} from '@components/core';
import formatUtils from '@utils/format';
import {TRANSFER_STATUS} from '@src/redux/actions/uniswap';
import {DepositHistory as DepositHistoryModel} from '@src/models/uniswapHistory';
import stylesheet from './style';
import TransactionID from './TransactionID';

const DepositHistory = ({
  dbId,
  txId,
  amount,
  account,
  tokenSymbol,
  status,
  lockTime,
  networkFee,
  networkFeeUnit,
  pDecimals,
  networkFeeDecimals,
  onDeposit,
  burnTxId,
}) => (
  <View style={stylesheet.wrapper}>
    <Text numberOfLines={2} style={stylesheet.title}>
      Deposit {formatUtils.amountFull(amount, pDecimals)} {tokenSymbol} from {account}
    </Text>
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>TYPE</Text>
      <Text style={stylesheet.textRight}>Deposit</Text>
    </View>
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>ID</Text>
      <Text style={stylesheet.textRight}>{dbId}</Text>
    </View>
    <TransactionID txId={txId} />
    <TransactionID txId={burnTxId} title="BURN TX" />
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>TIME</Text>
      <Text style={stylesheet.textRight}>{formatUtils.formatUnixDateTime(lockTime)}</Text>
    </View>
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>STATUS</Text>
      <Text style={[stylesheet.textRight, stylesheet[status]]} numberOfLines={2}>
        {
          _.capitalize(
            DepositHistoryModel.currentDeposit?.id === history.id ? 'pending' :
              status
          )}
      </Text>
    </View>
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>AMOUNT</Text>
      <Text style={stylesheet.textRight} numberOfLines={2}>{formatUtils.amountFull(amount, pDecimals)} {tokenSymbol}</Text>
    </View>
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>NETWORK FEE</Text>
      <Text style={stylesheet.textRight} numberOfLines={2}>{formatUtils.amountFull(networkFee, networkFeeDecimals)} {networkFeeUnit}</Text>
    </View>
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>FROM</Text>
      <Text style={stylesheet.textRight} numberOfLines={2}>{account}</Text>
    </View>
    {status === TRANSFER_STATUS.INTERRUPTED && DepositHistoryModel.currentDeposit?.id !== history.id &&
    <Button style={stylesheet.button} title="Try again" onPress={onDeposit} />
    }
  </View>
);

DepositHistory.defaultProps = {
  status: ''
};

DepositHistory.propTypes = {
  txId: PropTypes.string.isRequired,
  tokenSymbol: PropTypes.string.isRequired,
  amount: PropTypes.string.isRequired,
  account: PropTypes.string.isRequired,
  networkFee: PropTypes.string.isRequired,
  networkFeeUnit: PropTypes.string.isRequired,
  lockTime: PropTypes.number.isRequired,
  status: PropTypes.string,
};

export default DepositHistory;
