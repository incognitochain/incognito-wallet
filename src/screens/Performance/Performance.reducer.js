import { ACTION_LOG_EVENT, ACTION_TOGGLE } from './Performance.constant';

const initialState = {
  data: [],
  toggle: true,
  time: new Date().getTime(),
};

export default (state = initialState, action) => {
  switch (action.type) {
  case ACTION_LOG_EVENT: {
    const { restart, timestamp } = action.payload;
    if (restart) {
      return { ...state, time: timestamp };
    }
    return {
      ...state,
      data: [...state.data, action.payload],
      time: timestamp,
    };
  }
  case ACTION_TOGGLE: {
    return {
      ...state,
      toggle: !state.toggle,
    };
  }
  default:
    return state;
  }
};
