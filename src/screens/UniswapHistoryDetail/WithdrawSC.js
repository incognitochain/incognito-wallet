import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { View, Text } from '@components/core';
import formatUtils from '@utils/format';
import TokenID from '@screens/UniswapHistoryDetail/TokenID';
import stylesheet from './style';

const WithdrawSC = ({
  txId,
  dbId,
  token,
  value,
  status,
  lockTime,
}) => (
  <View style={stylesheet.wrapper}>
    <Text numberOfLines={2} style={stylesheet.title}>
      Withdraw {token} to pDEX
    </Text>
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>TYPE</Text>
      <Text style={stylesheet.textRight}>Withdraw to pDEX</Text>
    </View>
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>ID</Text>
      <Text style={stylesheet.textRight}>{dbId}</Text>
    </View>
    <TokenID txId={txId} label="ERC20 TX" />
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>TIME</Text>
      <Text style={stylesheet.textRight}>{formatUtils.formatUnixDateTime(lockTime)}</Text>
    </View>
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>STATUS</Text>
      <Text style={[stylesheet.textRight, stylesheet[status]]} numberOfLines={2}>{_.capitalize(status)}</Text>
    </View>
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>AMOUNT</Text>
      <Text style={stylesheet.textRight} numberOfLines={2}>{value} {token}</Text>
    </View>
  </View>
);

WithdrawSC.defaultProps = {
  status: ''
};

WithdrawSC.propTypes = {
  txId: PropTypes.string.isRequired,
  inputToken: PropTypes.string.isRequired,
  inputValue: PropTypes.string.isRequired,
  outputToken: PropTypes.string.isRequired,
  outputValue: PropTypes.string.isRequired,
  networkFee: PropTypes.string.isRequired,
  networkFeeUnit: PropTypes.string.isRequired,
  tradingFee: PropTypes.string.isRequired,
  stopPrice: PropTypes.string.isRequired,
  lockTime: PropTypes.number.isRequired,
  status: PropTypes.string,
};

export default WithdrawSC;
