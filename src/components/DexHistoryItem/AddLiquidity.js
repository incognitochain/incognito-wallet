import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Icon } from 'react-native-elements';
import {View, Text, ActivityIndicator, TouchableOpacity} from '@components/core';
import { COLORS } from '@src/styles';
import formatUtils from '@utils/format';
import stylesheet from './style';

const AddLiquidityHistory = ({ token1, token2, status, onPress, isLastItem, style }) => (
  <TouchableOpacity style={[stylesheet.history, stylesheet.row, isLastItem && stylesheet.lastItem, style]} onPress={onPress}>
    <View style={[stylesheet.shortInfo]}>
      <Text style={stylesheet.historyType}>Add liquidity</Text>
      <Text style={stylesheet.shortDesc} numberOfLines={2}>
        {formatUtils.amountFull(token1.TokenAmount || 0, token1.PDecimals)} {token1.TokenSymbol}
        &nbsp;+ {formatUtils.amountFull(token2.TokenAmount || 0, token2.PDecimals)} {token2.TokenSymbol}
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

AddLiquidityHistory.defaultProps = {
  status: undefined,
  isLastItem: false,
  style: {},
};

AddLiquidityHistory.propTypes = {
  tokenSymbol: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  pDecimals: PropTypes.number.isRequired,
  account: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  style: PropTypes.object,
  status: PropTypes.string,
  isLastItem: PropTypes.bool,
};

export default AddLiquidityHistory;
