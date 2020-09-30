import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Icon } from 'react-native-elements';
import {View, Text, ActivityIndicator, TouchableOpacity} from '@components/core';
import { COLORS } from '@src/styles';
import stylesheet from './style';

const RemoveLiquidityHistory = ({ token1, token2, status, onPress, isLastItem, style }) => (
  <TouchableOpacity style={[stylesheet.history, stylesheet.row, isLastItem && stylesheet.lastItem, style]} onPress={onPress}>
    <View style={[stylesheet.shortInfo]}>
      <Text style={stylesheet.historyType}>Remove liquidity</Text>
      <Text style={stylesheet.shortDesc} numberOfLines={2}>
        {token1.TokenAmount} {token1.TokenSymbol}
        &nbsp;+ {token2.TokenAmount} {token2.TokenSymbol}
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

RemoveLiquidityHistory.defaultProps = {
  status: undefined,
  isLastItem: false,
  style: {},
};

RemoveLiquidityHistory.propTypes = {
  token1: PropTypes.shape({
    TokenAmount: PropTypes.string.isRequired,
    TokenSymbol: PropTypes.string.isRequired,
  }).isRequired,
  token2: PropTypes.shape({
    TokenAmount: PropTypes.string.isRequired,
    TokenSymbol: PropTypes.string.isRequired,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
  style: PropTypes.object,
  status: PropTypes.string,
  isLastItem: PropTypes.bool,
};

export default RemoveLiquidityHistory;
