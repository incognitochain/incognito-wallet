import { Text, View } from '@components/core';
import PropTypes from 'prop-types';
import _ from 'lodash';
import React from 'react';
import formatUtils from '@src/utils/format';
import { PRV } from '@src/services/wallet/tokenService';
import { rewardStyle } from './style';

const formatBalance = (balanceCurrent, pDecimals) => {
  let maxDigit = 2;
  if (balanceCurrent <= 1) {
    maxDigit = 9;
  }
  if (balanceCurrent > 1) {
    maxDigit = 6;
  }
  let totalBalanceCurrent = formatUtils.balance(
    balanceCurrent,
    pDecimals,
    maxDigit,
  );
  let res = _.round(totalBalanceCurrent, 9);
  if (_.isNaN(res)) {
    return 0;
  }
  return _.round(totalBalanceCurrent, 9);
};
const Reward = ({ symbol, pDecimals, balance, isDefault, balanceStyle, containerItemStyle }) => (
  <View style={rewardStyle.container}>
    <View style={[{ flexDirection: 'row' }, containerItemStyle]}>
      {isDefault && isDefault ? (
        <Text style={[rewardStyle.balance, balanceStyle]} numberOfLines={1}>
          {symbol === PRV?.symbol ? 'ℙ' : symbol}{formatBalance(formatUtils.amount(balance, pDecimals, true))}
        </Text>
      ) : (
        <Text style={[rewardStyle.balance, balanceStyle]} numberOfLines={1}>
          {formatBalance(formatUtils.amount(balance, pDecimals, true))}{symbol === PRV?.symbol ? 'ℙ' : symbol}
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

