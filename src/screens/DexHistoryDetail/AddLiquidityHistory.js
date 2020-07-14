import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { View, Text, Button, TouchableOpacity, RoundCornerButton } from '@components/core';
import formatUtils from '@utils/format';
import {TRANSFER_STATUS} from '@src/redux/actions/dex';
import {PRV} from '@services/wallet/tokenService';
import TransactionID from './TransactionID';
import TokenID from './TokenID';
import stylesheet from './style';

const DexHistory = ({
  pairId,
  txId,
  txId2,
  lockTime,
  account,
  status,
  token1,
  token2,
  inputFee,
  outputFee,
  paymentAddress,
  onAdd,
  onCancel,
}) => (
  <View style={stylesheet.wrapper}>
    <Text style={stylesheet.title} numberOfLines={2}>
      ADD {formatUtils.amountFull(token1.TokenAmount || 0, token1.PDecimals)} {token1.TokenSymbol}
      &nbsp;+ {formatUtils.amountFull(token2.TokenAmount || 0, token2.PDecimals)} {token2.TokenSymbol}
    </Text>
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>TYPE</Text>
      <Text style={stylesheet.textRight}>Add Liquidity</Text>
    </View>
    <TransactionID txId={txId} title={`${token1.TokenSymbol} TRANSACTION ID`} />
    {!!txId2 && <TransactionID txId={txId2} title={`${token2.TokenSymbol} TRANSACTION ID`} />}
    {/*{!!cancelTx && <TransactionID txId={cancelTx} title="CANCEL TRANSACTION ID" />}*/}
    <TokenID text={pairId} label="PAIR ID" />
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>TIME</Text>
      <Text style={stylesheet.textRight}>{formatUtils.formatUnixDateTime(lockTime)}</Text>
    </View>
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>STATUS</Text>
      <Text style={[stylesheet.textRight, stylesheet[status]]} numberOfLines={2}>
        {status === TRANSFER_STATUS.INTERRUPTED ? 'Paused' : _.capitalize(status) }
      </Text>
    </View>
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>NETWORK FEE</Text>
      <Text style={stylesheet.textRight} numberOfLines={1}>{formatUtils.amountFull(inputFee + outputFee, PRV.pDecimals)} {PRV.symbol}</Text>
    </View>
    {!!token1.ReturnedAmount && (
    <>
      <View style={stylesheet.row}>
        <Text style={stylesheet.field}>{`${token1.TokenSymbol} CONTRIBUTED AMOUNT`}</Text>
        <Text
          style={stylesheet.textRight}
          numberOfLines={1}
        >{formatUtils.amountFull(token1.ContributedAmount, token1.PDecimals)}
        </Text>
      </View>
      <View style={stylesheet.row}>
        <Text style={stylesheet.field}>{`${token1.TokenSymbol} RETURNED AMOUNT`}</Text>
        <Text
          style={stylesheet.textRight}
          numberOfLines={1}
        >{formatUtils.amountFull(token1.ReturnedAmount, token1.PDecimals)}
        </Text>
      </View>
    </>
    )}
    {!!token2.ReturnedAmount && (
    <>
      <View style={stylesheet.row}>
        <Text style={stylesheet.field}>{`${token2.TokenSymbol} CONTRIBUTED AMOUNT`}</Text>
        <Text style={stylesheet.textRight} numberOfLines={1}>{formatUtils.amountFull(token2.ContributedAmount, token2.PDecimals)}</Text>
      </View>
      <View style={stylesheet.row}>
        <Text style={stylesheet.field}>{`${token2.TokenSymbol} RETURNED AMOUNT`}</Text>
        <Text style={stylesheet.textRight} numberOfLines={1}>{formatUtils.amountFull(token2.ReturnedAmount, token2.PDecimals)}</Text>
      </View>
    </>
    )}
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>FROM</Text>
      <Text style={stylesheet.textRight} numberOfLines={1}>{account}</Text>
    </View>
    <TokenID text={paymentAddress} label="PAYMENT ADDRESS" />
    {status === TRANSFER_STATUS.INTERRUPTED && (
      <View>
        <RoundCornerButton style={stylesheet.button} title="Try again" onPress={onAdd} />
        <TouchableOpacity onPress={onCancel} style={stylesheet.cancelButton} activeOpacity={0.6}>
          <Text style={stylesheet.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

DexHistory.defaultProps = {
  status: '',
  txId2: '',
};

DexHistory.propTypes = {
  txId: PropTypes.string.isRequired,
  txId2: PropTypes.string,
  lockTime: PropTypes.number.isRequired,
  pairId: PropTypes.string.isRequired,
  token1: PropTypes.shape({
    TokenID: PropTypes.string.isRequired,
    TokenSymbol: PropTypes.string.isRequired,
    PDecimals: PropTypes.number.isRequired,
    TokenAmount: PropTypes.number.isRequired,
    ReturnedAmount: PropTypes.number,
    ContributedAmount: PropTypes.number,
  }).isRequired,
  token2: PropTypes.shape({
    TokenID: PropTypes.string.isRequired,
    TokenSymbol: PropTypes.string.isRequired,
    PDecimals: PropTypes.number.isRequired,
    TokenAmount: PropTypes.number.isRequired,
    ReturnedAmount: PropTypes.number,
    ContributedAmount: PropTypes.number,
  }).isRequired,
  inputFee: PropTypes.number.isRequired,
  outputFee: PropTypes.number.isRequired,
  account: PropTypes.string.isRequired,
  paymentAddress: PropTypes.string.isRequired,
  onAdd: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  status: PropTypes.string,
};

export default DexHistory;
