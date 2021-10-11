import { ExHandler } from '@src/services/exception';
import { actionFetch as actionFetchListShare } from '@screens/PDexV3/features/Portfolio';
import {
  actionFetchPools,
} from '@screens/PDexV3/features/Pools';
import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
  ACTION_FREE_HOME_PDEX_V3,
} from './Home.constant';
import { homePDexV3Selector } from './Home.selector';

export const actionFetching = () => ({
  type: ACTION_FETCHING,
});

export const actionFetched = () => ({
  type: ACTION_FETCHED,
});

export const actionFetchFail = () => ({
  type: ACTION_FETCH_FAIL,
});

export const actionFreeHomePDexV3 = () => ({
  type: ACTION_FREE_HOME_PDEX_V3,
});

export const actionRefresh = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const { isFetching } = homePDexV3Selector(state);
    if (isFetching) {
      return;
    }
    await dispatch(actionFetching());
    await Promise.all([
      dispatch(actionFetchPools()),
      dispatch(actionFetchListShare()),
    ]);
  } catch (error) {
    new ExHandler(error).showErrorToast();
  } finally {
    dispatch(actionFetched());
  }
};
