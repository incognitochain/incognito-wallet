import { defaultAccountWalletSelector } from '@src/redux/selectors/account';
import { ExHandler } from '@src/services/exception';
import { getPDexV3Instance } from '@screens/PDexV3';
import uniq from 'lodash/uniq';
import BigNumber from 'bignumber.js';
import orderBy from 'lodash/orderBy';
import { batch } from 'react-redux';
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
    const pools = (await pDexV3Inst.getListPools('all')) || [];
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
    const payload =
      poolsIDs
        .map((poolId) => pools.find((pool) => pool?.poolId === poolId))
        .filter((pool) => !!pool)
        .filter((pool) => !!pool.isVerify) || [];
    batch(() => {
      dispatch(actionFetchedListPools(orderBy(payload, 'volume', 'desc')));
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
