import { combineReducers } from 'redux';
import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
  ACTION_LOAD_MORE,
  ACTION_READ_ALL,
  ACTION_DELETE,
  ACTION_READ,
  ACTION_INIT,
  ACTION_REFRESH,
  ACTION_HAS_NOTI,
  ACTION_UPDATE_RECENTLY,
} from './Notification.constant';
import { updateReadAll } from './Notification.utils';

const initialState = {
  init: false,
  isFetching: false,
  isFetched: false,
  isRefresh: false,
  data: {
    list: [],
    limit: 20,
    page: 1,
    over: false,
    isReadAll: true,
  },
  recently: { id: -1 },
};

const notification = (state = initialState, action) => {
  switch (action.type) {
  case ACTION_UPDATE_RECENTLY: {
    return {
      ...state,
      recently: { ...action.payload },
    };
  }
  case ACTION_HAS_NOTI: {
    const item = { ...action.payload };
    const list = [
      item,
      ...state.data.list.filter((notify) => notify.id !== item.id),
    ];
    return {
      ...state,
      data: {
        ...state.data,
        list,
        isReadAll: updateReadAll(list),
      },
    };
  }
  case ACTION_INIT: {
    return { ...state, init: true };
  }
  case ACTION_REFRESH: {
    return {
      ...state,
      isRefresh: true,
      data: {
        ...state.data,
        over: false,
      },
    };
  }
  case ACTION_FETCHING: {
    return {
      ...state,
      isFetching: true,
    };
  }
  case ACTION_FETCHED: {
    return {
      ...state,
      isFetching: false,
      isFetched: true,
      isRefresh: false,
      data: {
        ...state.data,
        ...action.payload,
      },
    };
  }
  case ACTION_FETCH_FAIL: {
    return {
      ...state,
      isRefresh: false,
      isFetched: false,
      isFetching: false,
    };
  }
  case ACTION_LOAD_MORE: {
    return {
      ...state,
      data: {
        ...state.data,
        page: ++state.data.page,
      },
    };
  }
  case ACTION_READ_ALL: {
    return {
      ...state,
      data: {
        ...state.data,
        list: [...state.data.list.map((item) => ({ ...item, read: true }))],
        isReadAll: action.payload,
      },
    };
  }
  case ACTION_DELETE: {
    const itemRemoved = action.payload;
    const list = [
      ...state.data.list.filter((item) => item?.id !== itemRemoved?.id),
    ];
    return {
      ...state,
      data: {
        ...state.data,
        list,
        isReadAll: updateReadAll(list),
      },
    };
  }
  case ACTION_READ: {
    const itemMarked = action.payload;
    const list = [
      ...state.data.list.map((item) =>
          item?.id === itemMarked?.id ? { ...item, read: true } : item,
      ),
    ];
    return {
      ...state,
      data: {
        ...state.data,
        list,
        isReadAll: updateReadAll(list),
      },
    };
  }
  default:
    return state;
  }
};

export default notification;
