import isArray from 'lodash/isArray';
import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
} from './Home.constant';
import { apiGetHomeConfigs } from './Home.services';
import { HOME_CONFIGS } from './Home.utils';

export const actionFetching = () => ({
  type: ACTION_FETCHING,
});

export const actionFetched = (payload) => ({
  type: ACTION_FETCHED,
  payload,
});

export const actionFetchFail = () => ({
  type: ACTION_FETCH_FAIL,
});

export const actionFetch = () => async (dispatch, getState) => {
  const { defaultConfigs, isFetching, isFetched } = getState()?.home;
  if (isFetching || (isFetched && !isFetching)) {
    return;
  }
  let categories = isArray(defaultConfigs?.categories)
    ? defaultConfigs?.categories
    : HOME_CONFIGS.categories;
  let headerTitle = defaultConfigs?.headerTitle
    ? defaultConfigs?.headerTitle
    : HOME_CONFIGS.headerTitle;
  try {
    await dispatch(actionFetching());
    const { data } = await apiGetHomeConfigs();
    categories = data?.categories || [];
    headerTitle = data?.headerTitle?.title.replace('\\n', '\n') || '';
  } catch (error) {
    console.debug('error', error);
  } finally {
    await dispatch(
      actionFetched({
        categories,
        headerTitle,
      }),
    );
  }
};
