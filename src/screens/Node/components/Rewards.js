import React from 'react';
import PropTypes from 'prop-types';
import Swiper from 'react-native-swiper';
import {ActivityIndicator, View} from '@components/core';
import _ from 'lodash';
import convert from '@utils/convert';
import {PRV_ID} from '@screens/Dex/constants';
import {PRV} from '@services/wallet/tokenService';
import { rewardStyle } from './style';
import Reward from './Reward';

const Rewards = ({ rewards: propRewards, allTokens, item, isDefault }) => {
  if (!allTokens || allTokens.length === 0) {
    return <ActivityIndicator />;
  }

  const rewards = !_.isEmpty(propRewards) ? propRewards : { [PRV_ID] : 0};
  const data = _(Object.keys(rewards))
    .map(id => {
      const value = rewards[id];
      const token = allTokens.find(token => token.id === id) || {};
      return token && { ...token, balance: value, displayBalance: convert.toHumanAmount(value, token.pDecimals) };
    })
    .filter(token => token)
    .orderBy([token => token.id === PRV_ID, 'displayBalance'], ['desc', 'desc'])
    .value();

  if (!data.find(item => item.id === PRV_ID)) {
    data.push({ ...PRV, balance: 0, displayBalance: 0 });
  }

  return (
    <View style={rewardStyle.slider}>
      <Swiper
        dotStyle={rewardStyle.dot}
        activeDotStyle={rewardStyle.activeDot}
        showsPagination
        loop
        horizontal
        key={`${item.ProductId}-${data.length}`}
      >
        {
          data.map(({ id, pDecimals, balance, symbol, isVerified }) => (
            <Reward
              key={id}
              tokenId={id}
              isDefault={isDefault}
              pDecimals={pDecimals}
              symbol={symbol}
              balance={balance}
              isVerified={isVerified}
            />
          ))
        }
      </Swiper>
    </View>
  );
};

Rewards.propTypes = {
  allTokens: PropTypes.array.isRequired,
  rewards: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
};

export default Rewards;
