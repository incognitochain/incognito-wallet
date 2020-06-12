import React from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, Button, Image, ScrollView, Text, TouchableOpacity, View } from '@components/core';
import icInvest from '@src/assets/images/invest_icon.png';

import icBTC from '@src/assets/images/coins/ic_btc.png';
import icPRV from '@src/assets/images/coins/ic_prv.png';
import icETH from '@src/assets/images/coins/ic_eth.png';
import icXMR from '@src/assets/images/coins/ic_xmr.png';
import icUSDT from '@src/assets/images/coins/ic_usdt.png';
import icUSDC from '@src/assets/images/coins/ic_usdc.png';
import InvestReward from '@screens/Dex/components/InvestReward';
import {getRewards} from '@services/api/pdefi';
import _ from 'lodash';
import {CONSTANT_COMMONS} from '@src/constants';
import {PRV_ID} from '@screens/Dex/constants';
import format from '@utils/format';
import {getNodeTime} from '@services/wallet/RpcClientService';
import {RefreshControl} from 'react-native';
import { Icon } from 'react-native-elements';
import { COLORS } from '@src/styles';
import styles from './style';

const items = [
  {
    icon: icPRV,
    symbol: 'PRV',
    interest: '62.7%',
  },
  {
    icon: icBTC,
    symbol: 'BTC',
    interest: '5%',
  },
  {
    icon: icETH,
    symbol: 'ETH',
    interest: '8.5%',
  },
  {
    icon: icXMR,
    symbol: 'XMR',
    interest: '8%',
  },
  {
    icon: icUSDT,
    symbol: 'USDT',
    interest: '8%',
  },
  {
    icon: icUSDC,
    symbol: 'USDC',
    interest: '8%',
  },
];

let rewardInterval;
const TIME = 100;
let serverTime = 0;

const GetStartedInvest = ({ onPress, accounts, pairs, shares }) => {
  // const [loading, setLoading] = React.useState(true);
  // const [rewards, setRewards] = React.useState(null);
  // const [reloading, setReloading] = React.useState(false);
  // const [totalReward, setTotalReward] = React.useState(0);
  //
  // const loadData = async () => {
  //   clearInterval(rewardInterval);
  //   const rawShares = JSON.stringify(shares);
  //   const investAccounts = accounts
  //     .filter(account => rawShares.includes(account.PaymentAddress));
  //
  //   const rewards = _.flatten(await Promise.all(investAccounts.map(account => getRewards(account.PaymentAddress))))
  //     .filter(reward => reward.total || reward.amount1 || reward.amount2);
  //   serverTime = (await getNodeTime()) - (TIME / 1000);
  //
  //   // const rewards = await getRewards('12RqXMEeH55Yw9JRBSe84zd81GgnMvSnMKQTucm29LrM1GwmrMyDZGaoSDY8oBL47L281SRnKbFhFWAyDLDWkHxdkZuiunG6pMWyvSH');
  //   setRewards(rewards);
  //   setLoading(false);
  // };
  //
  // const reloadData = async () => {
  //   setReloading(true);
  //   await loadData();
  //   setReloading(false);
  // };
  //
  // const calculateOutputValue = (outputTokenId, inputTokenId, inputValue) => {
  //   try {
  //     if (inputValue) {
  //       return 0;
  //     }
  //
  //     const pair = pairs.find(i => {
  //       const keys = Object.keys(i);
  //       return keys.includes(outputTokenId) && keys.includes(inputTokenId);
  //     });
  //
  //     const inputPool = pair[inputTokenId];
  //     const outputPool = pair[outputTokenId];
  //     const initialPool = inputPool * outputPool;
  //     const newInputPool = inputPool + inputValue - 0;
  //     const newOutputPoolWithFee = _.ceil(initialPool / newInputPool);
  //     return outputPool - newOutputPoolWithFee;
  //   } catch (error) {
  //     //
  //   }
  // };
  //
  // const calculateReward = () => {
  //   let totalReward = 0;
  //   rewards.forEach(reward => {
  //     const {amount1, amount2, tokenId1, tokenId2, interestRate1, interestRate2, total, beaconTime} = reward;
  //     serverTime += (TIME / 1000);
  //
  //     const time = serverTime - beaconTime;
  //
  //     const reward1 = Math.floor(
  //       amount1 * time * interestRate1 / 100 / CONSTANT_COMMONS.YEAR_SECONDS
  //     );
  //     const reward2 = Math.floor(
  //       amount2 * time * interestRate2 / 100 / CONSTANT_COMMONS.YEAR_SECONDS
  //     );
  //
  //     const prvReward1 = tokenId1 === PRV_ID ? reward1 : calculateOutputValue(PRV_ID, tokenId1, reward1);
  //     const prvReward2 = tokenId2 === PRV_ID ? reward2 : calculateOutputValue(PRV_ID, tokenId2, reward2);
  //
  //     // console.debug('TOTAL REWARD', serverTime, time, (new Date().getTime()) / 1000, beaconTime, total, prvReward2, prvReward1, totalReward, amount2, reward2);
  //     totalReward = totalReward + total + prvReward1 + prvReward2;
  //   });
  //
  //   totalReward = Math.floor(totalReward);
  //   let maxDigits = totalReward > 1000e9 ? 4 : 9;
  //   maxDigits = totalReward > 1000000e9 ? 0 : maxDigits;
  //
  //   const displayReward = format.balance(
  //     totalReward,
  //     9,
  //     maxDigits,
  //   );
  //   setTotalReward(displayReward);
  // };
  //
  // React.useEffect(() => {
  //   if (shares) {
  //     loadData();
  //   }
  //
  //   return () => {
  //     clearInterval(rewardInterval);
  //   };
  // }, [shares]);
  //
  // React.useEffect(() => {
  //   clearInterval(rewardInterval);
  //
  //   if (!rewards || rewards.length === 0) {
  //     return;
  //   }
  //
  //   calculateReward();
  //
  //   rewardInterval = setInterval(calculateReward, TIME);
  // }, [rewards]);

  // if (loading) {
  //   return <ActivityIndicator />;
  // }
  //
  // if (rewards && rewards.length > 0) {
  //   return (
  //     <ScrollView
  //       style={{ height: '100%' }}
  //       refreshControl={
  //         <RefreshControl refreshing={reloading} onRefresh={reloadData} />
  //       }
  //     >
  //       <InvestReward reward={totalReward} onPress={onPress} />
  //     </ScrollView>
  //   );
  // }

  const [expand, setExpand] = React.useState(false);

  return (
    <ScrollView style={{ height: '100%' }} contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.title}>Provide liquidity for pDEX.</Text>
        <Image source={icInvest} style={styles.image} />
        <Text style={styles.title}>Provide privacy for the world.</Text>
        <Text style={styles.description}>55,000 PRV will be distributed to liquidity providers in June.</Text>
      </View>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Button title="Get started" onPress={onPress} style={styles.btn} />
      </View>
      <TouchableOpacity style={styles.row} onPress={() => setExpand(!expand)}>
        <Text style={[styles.description, styles.more]}>
          Learn more
        </Text>
        {!expand ?
          <Icon containerStyle={styles.arrowIcon} type="material-community" name="chevron-right" color={COLORS.primary} />
          : <Icon containerStyle={styles.arrowIcon} type="material-community" name="chevron-up" color={COLORS.primary} />
        }
      </TouchableOpacity>
      {expand && (
        <View>
          <Text style={styles.description}>Fixed rewards pool every month</Text>
          <Text style={styles.description}>Every PRV in any liquidity pool qualifies for rewards</Text>
          <Text style={styles.description}>Distribution every Monday 08:00 UTC</Text>
        </View>
      )}
    </ScrollView>
  );
};

GetStartedInvest.propTypes = {
  onPress: PropTypes.func.isRequired,
  accounts: PropTypes.array.isRequired,
  pairs: PropTypes.array.isRequired,
  shares: PropTypes.array.isRequired,
};

export default GetStartedInvest;
