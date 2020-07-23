import {
  ACTION_FETCHING_NEWS,
  ACTION_FETCHED_NEWS,
  ACTION_FETCH_FAIL_NEWS,
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
  let data = [];
  let isReadAll = false;
  const state = getState();
  try {
    const { isFetching } = newsSelector(state);
    if (isFetching) {
      return;
    }
    await dispatch(actionFetchingNews());
    const [news, unread] = await new Promise.all([
      apiGetNews(),
      apiCheckUnreadNews(),
    ]);
    data = news;
    isReadAll = unread === 0;
    await dispatch(
      actionFetchedNews({
        data,
        isReadAll,
      }),
    );
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
