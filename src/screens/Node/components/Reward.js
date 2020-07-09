import { Text, View } from '@components/core';
import PropTypes from 'prop-types';
import _ from 'lodash';
import React from 'react';
import formatUtils from '@src/utils/format';
import { PRV } from '@src/services/wallet/tokenService';
import { rewardStyle } from './style';

const Reward = ({ symbol, pDecimals, balance, isDefault, balanceStyle, containerItemStyle, idDefault }) => (
  <View style={rewardStyle.container}>
    <View style={[{ flexDirection: 'row' }, containerItemStyle]}>
      {isDefault && isDefault ? (
        <Text style={[rewardStyle.balance, balanceStyle]} numberOfLines={1}>
          {symbol === PRV?.symbol ? (idDefault ? 'PRV' : 'ℙ') : symbol} {(balance > 1? formatUtils.amountClipedRewards(balance, pDecimals, false, true) : formatUtils.amountClipedMaxRewards(balance, pDecimals, false, true))}
        </Text>
      ) : (
        <Text style={[rewardStyle.balance, balanceStyle]} numberOfLines={1}>
          {(balance > 1? formatUtils.amountClipedRewards(balance, pDecimals, false, true) : formatUtils.amountClipedMaxRewards(balance, pDecimals, false, true))} {symbol === PRV?.symbol ? (idDefault ? 'PRV' : 'ℙ') : symbol}
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

