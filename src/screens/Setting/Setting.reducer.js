import {
  ACTION_FETCHED_SERVER,
  ACTION_FETCHED_DEVICES,
} from './Setting.constant';

const initialState = {
  defaultServerId: 1,
  devices: [],
  server: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
  case ACTION_FETCHED_DEVICES: {
    return {
      ...state,
      devices: [...action.payload],
    };
  }
  case ACTION_FETCHED_SERVER: {
    return {
      ...state,
      server: { ...action.payload },
    };
  }
  default:
    return state;
  }
};
