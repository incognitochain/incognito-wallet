import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Icon } from 'react-native-elements';
import {View, Text, ActivityIndicator, TouchableOpacity} from '@components/core';
import { COLORS } from '@src/styles';
import stylesheet from './style';

const TradeHistory = ({ token, value, status, onPress, isLastItem, style }) => (
  <TouchableOpacity style={[stylesheet.history, stylesheet.row, isLastItem && stylesheet.lastItem, style]} onPress={onPress}>
    <View style={[stylesheet.shortInfo]}>
      <Text style={stylesheet.historyType}>Withdraw to pDEX</Text>
      <Text style={stylesheet.shortDesc} numberOfLines={2}>
        {`${value} ${token} to pDEX`}
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

TradeHistory.defaultProps = {
  status: undefined,
  isLastItem: false,
  style: {},
};

TradeHistory.propTypes = {
  token: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  account: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  style: PropTypes.object,
  status: PropTypes.string,
  isLastItem: PropTypes.bool,
};

export default TradeHistory;
