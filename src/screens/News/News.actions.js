import {
  ACTION_FETCHING_NEWS,
  ACTION_FETCHED_NEWS,
  ACTION_FETCH_FAIL_NEWS,
  ACTION_CHECK_UNREAD_NEWS,
} from './News.constant';
import {
  apiGetNews,
  apiCheckUnreadNews,
  apiReadNews,
  apiRemoveNews,
} from './News.services';
import { newsSelector } from './News.selector';

export const actionFetchingNews = () => ({
  type: ACTION_FETCHING_NEWS,
});

export const actionFetchedNews = (payload) => ({
  type: ACTION_FETCHED_NEWS,
  payload,
});

export const actionFetchFailNews = () => ({
  type: ACTION_FETCH_FAIL_NEWS,
});

export const actionFetchNews = () => async (dispatch, getState) => {
  const state = getState();
  try {
    const { isFetching } = newsSelector(state);
    if (isFetching) {
      return;
    }
    await dispatch(actionFetchingNews());
    const data = await apiGetNews();
    await dispatch(actionFetchedNews({ data }));
  } catch (error) {
    await dispatch(actionFetchFailNews());
    throw new Error(error);
  }
};

export const actionReadNews = (id) => async (dispatch) => {
  try {
    await apiReadNews({ id });
  } catch (error) {
    console.log(error);
  } finally {
    dispatch(actionFetchNews());
  }
};

export const actionRemoveNews = (id) => async (dispatch) => {
  try {
    await apiRemoveNews({ id });
  } catch (error) {
    console.log(error);
  } finally {
    dispatch(actionFetchNews());
  }
};

export const actionCheckUnreadNews = () => async (dispatch) => {
  try {
    const unread = await apiCheckUnreadNews();
    const isReadAll = unread === 0;
    dispatch({
      type: ACTION_CHECK_UNREAD_NEWS,
      payload: isReadAll,
    });
  } catch (error) {
    console.debug(error);
  }
};
