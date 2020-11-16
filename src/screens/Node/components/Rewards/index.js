import React from 'react';
import PropTypes from 'prop-types';
import Swiper from 'react-native-swiper';
import { View } from '@components/core';
import Reward from '../Reward';
import styles from './style';

const Rewards = ({ rewards }) => {
  return (
    <View style={[styles.rewards, rewards.length <= 1 ? styles.noDot : styles.haveDot]}>
      <Swiper
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
        showsPagination
        loop={false}
        paginationStyle={{ top: 60 }}
        horizontal
        removeClippedSubviews={false}
      >
        {
          rewards.map(({ id, pDecimals, balance, symbol, isVerified }) => (
            <Reward
              key={new Date().getTime()}
              tokenId={id}
              containerItemStyle={styles.balanceContainer}
              balanceStyle={styles.balanceUpdate}
              pDecimals={pDecimals}
              symbol={`${symbol} `}
              idDefault
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
  rewards: PropTypes.array.isRequired,
};

export default Rewards;
