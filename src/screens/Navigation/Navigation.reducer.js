import {
  ACTION_SET_CURRENT_SCREEN,
  ACTION_SET_PREV_SCREEN,
} from './Navigation.constant';

const initialState = {
  currentScreen: '',
  prevScreen: '',
};

export default (state = initialState, action) => {
  switch (action.type) {
  case ACTION_SET_CURRENT_SCREEN: {
    return {
      ...state,
      currentScreen: action.payload,
    };
  }
  case ACTION_SET_PREV_SCREEN: {
    return {
      ...state,
      prevScreen: action.payload,
    };
  }
  default:
    return state;
  }
};
