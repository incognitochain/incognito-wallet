import { Text, View } from '@components/core';
import PropTypes from 'prop-types';
import React from 'react';
import formatUtils from '@src/utils/format';
import { PRV } from '@src/services/wallet/tokenService';
import { rewardStyle } from './style';

const formatBalance = (balanceCurrent, pDecimals) => {
  let maxDigit = 2;
  if (balanceCurrent <= 1000000000000000) {
    maxDigit = 4;
  }
  if (balanceCurrent <= 100000000000000) {
    maxDigit = 5;
  }
  if (balanceCurrent <= 10000000000000) {
    maxDigit = 6;
  }
  if (balanceCurrent <= 1000000000000) {
    maxDigit = 7;
  }
  if (balanceCurrent <= 100000000000) {
    maxDigit = 8;
  }
  if (balanceCurrent <= 10000000000) {
    maxDigit = 9;
  }
  let totalBalanceCurrent = formatUtils.balance(
    balanceCurrent,
    pDecimals,
    maxDigit,
  );
  return totalBalanceCurrent;
};
const Reward = ({ symbol, pDecimals, balance, isDefault, balanceStyle, containerItemStyle }) => (
  <View style={rewardStyle.container}>
    <View style={[{ flexDirection: 'row' }, containerItemStyle]}>
      {isDefault && isDefault ? (
        <Text style={[rewardStyle.balance, balanceStyle]} numberOfLines={1}>
          {symbol === PRV?.symbol ? 'ℙ' : symbol}{formatBalance(formatUtils.amount(balance, pDecimals))}
        </Text>
      ) : (
        <Text style={[rewardStyle.balance, balanceStyle]} numberOfLines={1}>
          {formatBalance(formatUtils.amount(balance, pDecimals))}{symbol === PRV?.symbol ? 'ℙ' : symbol}
        </Text>
      )}
    </View>
  </View>
);


Reward.defaultProps = {
  pDecimals: 0,
};

Reward.propTypes = {
  tokenId: PropTypes.string.isRequired,
  symbol: PropTypes.string.isRequired,
  balance: PropTypes.number.isRequired,
  pDecimals: PropTypes.number,
  isVerified: PropTypes.bool.isRequired,
};

export default React.memo(Reward);

