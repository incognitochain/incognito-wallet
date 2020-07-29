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
  apiMarkReadAllNews,
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

export const actionFetchNews = (type = '') => async (dispatch, getState) => {
  const state = getState();
  try {
    const { isFetching } = newsSelector(state);
    if (isFetching) {
      return;
    }
    await dispatch(actionFetchingNews());
    let task = [apiGetNews()];
    switch (type) {
    case 'post': {
      task = [...task, apiMarkReadAllNews()];
      break;
    }
    default:
      task = [...task, apiCheckUnreadNews()];
      break;
    }
    const [news, unread] = await new Promise.all(task);
    let payload = {
      data: news,
    };
    if (type !== 'post') {
      payload = { ...payload, isReadAll: unread === 0 };
    }
    await dispatch(actionFetchedNews(payload));
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
