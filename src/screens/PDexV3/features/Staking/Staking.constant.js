import React from 'react';
import {Text} from 'react-native';
import {coinStyles as coinStyled} from '@screens/PDexV3/features/Staking/Staking.styled';

const TYPES = {
  ACTION_FETCHING: '[pDexV3][staking] Fetching data',
  ACTION_FETCH_FAIL: '[pDexV3][staking] Fetch fail data',
  ACTION_UPDATE_DATA: '[pDexV3][staking] Action update data',
  ACTION_SET_INVEST_COIN: '[pDexV3][staking] Action set invest coin',
  ACTION_SET_WITHDRAW_INVEST_COIN: '[pDexV3][staking] Action set withdraw invest coin',
  ACTION_SET_WITHDRAW_REWARD_COIN: '[pDexV3][staking] Action set withdraw reward coin',
  ACTION_FREE_STAKING: '[pDexV3][staking] Action free staking',
  ACTION_FETCHING_HISTORIES: '[pDexV3][staking] Action update fetching histories',
  ACTION_FETCHED_HISTORIES: '[pDexV3][staking] Action update fetched histories',
  ACTION_UPDATE_HISTORIES: '[pDexV3][staking] Action update histories',
  ACTION_SET_HISTORIES_KEY: '[pDexV3][staking] Action set histories key',
  ACTION_UPDATE_FETCHING_POOL: '[pDexV3][staking] Action update fetching pool',
  ACTION_SET_POOL: '[pDexV3][staking] Action set pool',
};

export const STAKING_MESSAGES = {
  staking: 'Stake',
  stakingMore: 'Stake more',
  stakingNow: 'Stake now',
  withdraw: 'Withdraw',
  buyCrypto: 'Buy crypto',
  selectCoin: 'Select coin',
  stakeSymbol: symbol => `Stake ${symbol}`,
  withdrawSymbol: symbol => `Withdraw ${symbol}`,
  orderReview: 'Order preview',
  reward: 'Reward',
  histories: 'Histories',
  history: 'History',
  portfolio: 'My portfolio',
  listCoins: 'Coins',
  stakeMore: 'Stake more',
  stakeNow: 'Stake now',
  withdrawReward: 'Withdraw reward',
  withdrawStaking: 'Withdraw stake',
  waitNFT: 'Waiting tickets...',
  cantWithdraw: 'You don\'t have any spare tickets to make this transaction. Wait for one to free up, or mint another.',
  pendingNFTs: (onPress) => (
    <Text style={coinStyled.warning}>
      You don&apos;t have any spare tickets&nbsp;
      <Text style={{textDecorationLine: 'underline' }} onPress={() => typeof onPress === 'function' && onPress()}> NFTs</Text> to make this transaction. Wait for one to free up, or mint another.
    </Text>
  )
};

export const formConfigsInvest = {
  formName: 'FORM_INVEST',
  input: 'input'
};

export const formConfigsWithdrawInvest = {
  formName: 'FORM_WITHDRAW_INVEST',
  input: 'input'
};

export const formConfigsWithdrawReward = {
  formName: 'FORM_WITHDRAW_REWARD',
  input: 'input'
};

export const TABS = {
  ROOT_ID: 'staking-home',
  TAB_COINS: 'staking-coins',
  TAB_PORTFOLIO: 'staking-portfolio',
};

export default TYPES;
