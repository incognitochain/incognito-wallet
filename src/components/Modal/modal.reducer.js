import {ACTION_TOGGLE_MODAL} from './modal.constant';

const initialState = {
  visible: false,
  data: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
  case ACTION_TOGGLE_MODAL: {
    return {
      ...state,
      ...action.payload,
    };
  }
  default:
    return state;
  }
};
