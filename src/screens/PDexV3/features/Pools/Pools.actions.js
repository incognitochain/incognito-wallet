import { defaultAccountWalletSelector } from '@src/redux/selectors/account';
import { ExHandler } from '@src/services/exception';
import { getPDexV3Instance } from '@screens/PDexV3';
import uniq from 'lodash/uniq';
import BigNumber from 'bignumber.js';
import orderBy from 'lodash/orderBy';
import { batch } from 'react-redux';
import {uniqBy} from 'lodash';
import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
  ACTION_FETCHED_TRADING_VOLUME_24H,
  ACTION_FETCHED_LIST_POOLS,
  ACTION_FETCHED_LIST_POOLS_DETAIL,
  ACTION_FETCHED_LIST_POOLS_FOLLOWING,
  ACTION_FREE_LIST_POOL,
  ACTION_RESET,
} from './Pools.constant';
import { followPoolIdsSelector } from './Pools.selector';

export const actionReset = () => ({
  type: ACTION_RESET,
});

export const actionFetchedTradingVolume24h = (payload) => ({
  type: ACTION_FETCHED_TRADING_VOLUME_24H,
  payload,
});

export const actionFetchedListPools = (payload) => ({
  type: ACTION_FETCHED_LIST_POOLS,
  payload,
});

export const actionFetchedListPoolsDetail = (payload) => ({
  type: ACTION_FETCHED_LIST_POOLS_DETAIL,
  payload,
});

export const actionFetchedListPoolsFollowing = (payload) => ({
  type: ACTION_FETCHED_LIST_POOLS_FOLLOWING,
  payload,
});

export const actionFetching = () => ({
  type: ACTION_FETCHING,
});

export const actionFetched = () => ({
  type: ACTION_FETCHED,
});

export const actionFetchFail = () => ({
  type: ACTION_FETCH_FAIL,
});

export const actionFreeListPools = () => ({
  type: ACTION_FREE_LIST_POOL,
});

export const actionFetchListPools = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const followIds = followPoolIdsSelector(state);
    await dispatch(actionFetching());
    const pDexV3Inst = await getPDexV3Instance();
    const pools = (await pDexV3Inst.getListPools('all&verify=true')) || [];
    const volume = pools.reduce(
      (prev, curr) => new BigNumber(Math.ceil(curr.volume)).plus(prev),
      new BigNumber(0),
    );
    const originalVolume = new BigNumber(volume)
      .multipliedBy(Math.pow(10, 9))
      .toNumber();
    let poolsIDs = pools.map((pool) => pool?.poolId) || [];
    poolsIDs = [...followIds, ...poolsIDs];
    poolsIDs = uniq(poolsIDs);
    const priority = {
      // PRV-USDT
      '0000000000000000000000000000000000000000000000000000000000000004-076a4423fa20922526bd50b0d7b0dc1c593ce16e15ba141ede5fb5a28aa3f229-33a8ceae6db677d9860a6731de1a01de7e1ca7930404d7ec9ef5028f226f1633': 4,
      // PRV-BTC
      '0000000000000000000000000000000000000000000000000000000000000004-b832e5d3b1f01a4f0623f7fe91d6673461e1f5d37d91fe78c5c2e6183ff39696-b2769c3d130a565027f05f74345760653bfc71200c3df9829e0e931a34f76cb4': 3,
      // PRV-ETH
      '0000000000000000000000000000000000000000000000000000000000000004-3ee31eba6376fc16cadb52c8765f20b6ebff92c0b1c5ab5fc78c8c25703bb19e-407b251bb4a262391cad3fda612f9b0fd5c282ed0624815450a0cfa53410c6ec': 2,
      // PRV-XMR
      '0000000000000000000000000000000000000000000000000000000000000004-c01e7dc1d1aba995c19b257412340b057f8ad1482ccb6a9bb0adce61afbf05d4-dab0cd71061e9dcc3135139e0e982845063933e3bc907b4e179e09f0f25d19e6': 1,
    };
    // sort PRV Pools to the top
    const payload =
      poolsIDs
        .map((poolId) => {
          const pool = pools.find((pool) => pool?.poolId === poolId);
          const _priority = priority[pool?.poolId] || 0;
          return {
            ...pool,
            priority: _priority
          };
        })
        .filter((pool) => !!pool)
        .filter((pool) => !!pool?.isVerify) || [];
    let topPools = payload.filter((pool) => Object.keys(priority).includes(pool.poolId));
    topPools = orderBy(topPools, 'apy', 'desc');
    const bottomPools = orderBy(payload, 'apy', 'desc');
    const newPools = uniqBy([...topPools, ...bottomPools], 'poolId');
    batch(() => {
      dispatch(actionFetchedListPools(newPools));
      dispatch(actionFetchedTradingVolume24h(originalVolume));
      dispatch(actionFetched());
    });
  } catch (error) {
    dispatch(actionFetchFail());
    throw error;
  }
};

export const actionFetchListFollowingPools = () => async (
  dispatch,
  getState,
) => {
  try {
    const state = getState();
    const account = defaultAccountWalletSelector(state);
    const pDexV3Inst = await getPDexV3Instance({ account });
    const followIds = (await pDexV3Inst.getListFollowingPools()) || [];
    await dispatch(actionFetchedListPoolsFollowing({ followIds }));
  } catch (error) {
    new ExHandler(error).showErrorToast();
  }
};

export const actionFetchPools = () => async (dispatch) => {
  try {
    await dispatch(actionFetchListFollowingPools());
    await dispatch(actionFetchListPools());
  } catch (error) {
    console.log('FETCH POOLS ERROR', error);
    new ExHandler(error).showErrorToast();
  }
};

export const actionToggleFollowingPool = (poolId) => async (
  dispatch,
  getState,
) => {
  try {
    const state = getState();
    const account = defaultAccountWalletSelector(state);
    const pDexV3Inst = await getPDexV3Instance({ account });
    const followPoolIds = followPoolIdsSelector(state);
    const isFollowed =
      followPoolIds.findIndex((_poolId) => _poolId === poolId) > -1;
    if (isFollowed) {
      await pDexV3Inst.removeFollowingPool({ poolId });
    } else if (!isFollowed) {
      await pDexV3Inst.addFollowingPool({ poolId });
    }
    await dispatch(actionFetchListFollowingPools());
  } catch (error) {
    new ExHandler(error).showErrorToast();
  }
};
