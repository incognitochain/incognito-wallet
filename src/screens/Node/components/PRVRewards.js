import React from 'react';
import PropTypes from 'prop-types';
import { View } from '@components/core';
import { isEmpty } from 'lodash';
import { COINS } from '@src/constants';
import Reward from './Reward';

const PRVRewards = ({ rewards }) => {
  const rewardsT = !isEmpty(rewards) ? rewards : { [COINS.PRV_ID] : 0};
  return (
    <View style={{ marginTop: 10 }}>
      <Reward
        tokenId={COINS.PRV_ID}
        pDecimals={COINS.PRV.pDecimals}
        symbol={COINS.PRV.symbol}
        balance={rewardsT[COINS.PRV_ID] || 0}
      />
    </View>
  );
};

PRVRewards.propTypes = {
  rewards: PropTypes.object.isRequired,
};

export default PRVRewards;
