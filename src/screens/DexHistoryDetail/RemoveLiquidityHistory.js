import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { View, Text, Button } from '@components/core';
import formatUtils from '@utils/format';
import {TRANSFER_STATUS} from '@src/redux/actions/dex';
import {PRV} from '@services/wallet/tokenService';
import TransactionID from './TransactionID';
import TokenID from './TokenID';
import stylesheet from './style';

const RemoveLiquidityHistory = ({
  txId,
  lockTime,
  shareValue,
  account,
  status,
  token1,
  token2,
  fee,
  paymentAddress,
  onAdd,
}) => (
  <View style={stylesheet.wrapper}>
    <Text style={stylesheet.title} numberOfLines={2}>
      Remove {token1.TokenAmount} {token1.TokenSymbol}
      &nbsp;+ {token2.TokenAmount} {token2.TokenSymbol}
    </Text>
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>TYPE</Text>
      <Text style={stylesheet.textRight}>Remove Liquidity</Text>
    </View>
    <TransactionID txId={txId} />
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>TIME</Text>
      <Text style={stylesheet.textRight}>{formatUtils.formatUnixDateTime(lockTime)}</Text>
    </View>
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>STATUS</Text>
      <Text style={[stylesheet.textRight, stylesheet[status]]} numberOfLines={1}>
        {status === TRANSFER_STATUS.INTERRUPTED ? 'Paused' : _.capitalize(status) }
      </Text>
    </View>
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>NETWORK FEE</Text>
      <Text style={stylesheet.textRight} numberOfLines={1}>{formatUtils.amountFull(fee, PRV.pDecimals)} {PRV.symbol}</Text>
    </View>
    <TokenID text={token1.TokenID} label={`${token1.TokenSymbol} COIN ID`} />
    <TokenID text={token2.TokenID} label={`${token2.TokenSymbol} COIN ID`} />
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>TO</Text>
      <Text style={stylesheet.textRight} numberOfLines={1}>{account}</Text>
    </View>
    <TokenID text={paymentAddress} label="PAYMENT ADDRESS" />
    {status === TRANSFER_STATUS.INTERRUPTED && <Button style={stylesheet.button} title="Try again" onPress={onAdd} />}
  </View>
);

RemoveLiquidityHistory.defaultProps = {
  status: '',
};

RemoveLiquidityHistory.propTypes = {
  txId: PropTypes.string.isRequired,
  lockTime: PropTypes.number.isRequired,
  shareValue: PropTypes.number.isRequired,
  token1: PropTypes.shape({
    TokenID: PropTypes.string.isRequired,
    TokenSymbol: PropTypes.string.isRequired,
    PDecimals: PropTypes.number.isRequired,
    TokenAmount: PropTypes.number.isRequired,
  }).isRequired,
  token2: PropTypes.shape({
    TokenID: PropTypes.string.isRequired,
    TokenSymbol: PropTypes.string.isRequired,
    PDecimals: PropTypes.number.isRequired,
    TokenAmount: PropTypes.number.isRequired,
  }).isRequired,
  fee: PropTypes.number.isRequired,
  account: PropTypes.string.isRequired,
  paymentAddress: PropTypes.string.isRequired,
  onAdd: PropTypes.func.isRequired,
  status: PropTypes.string,
};

export default RemoveLiquidityHistory;
