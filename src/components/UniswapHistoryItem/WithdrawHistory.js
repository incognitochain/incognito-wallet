import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Icon } from 'react-native-elements';
import {View, Text, ActivityIndicator, TouchableOpacity} from '@components/core';
import { COLORS } from '@src/styles';
import formatUtils from '@utils/format';
import stylesheet from './style';

const WithdrawHistory = ({ amount, tokenSymbol, pDecimals, account, status, onPress, isLastItem, style }) => (
  <TouchableOpacity style={[stylesheet.history, stylesheet.row, isLastItem && stylesheet.lastItem, style]} onPress={onPress}>
    <View style={[stylesheet.shortInfo]}>
      <Text style={stylesheet.historyType}>Withdraw</Text>
      <Text style={stylesheet.shortDesc} numberOfLines={2}>
        {`${formatUtils.amountFull(amount, pDecimals)} ${tokenSymbol} to ${account}`}
      </Text>
    </View>
    <View style={[stylesheet.textRight, stylesheet.row, stylesheet.historyStatus]}>
      {status === undefined ?
        <ActivityIndicator size="small" style={stylesheet.textRight} /> :
        <Text style={[stylesheet.textRight, stylesheet[status]]}>{_.capitalize(status)}</Text>
      }
      <View style={stylesheet.icon}>
        <Icon name="chevron-right" color={COLORS.lightGrey1} />
      </View>
    </View>
  </TouchableOpacity>
);

WithdrawHistory.defaultProps = {
  status: undefined,
  isLastItem: false,
  style: {},
};

WithdrawHistory.propTypes = {
  tokenSymbol: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  pDecimals: PropTypes.number.isRequired,
  account: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  style: PropTypes.object,
  status: PropTypes.string,
  isLastItem: PropTypes.bool,
};

export default WithdrawHistory;
