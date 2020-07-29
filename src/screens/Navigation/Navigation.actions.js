import {
  ACTION_SET_CURRENT_SCREEN,
  ACTION_SET_PREV_SCREEN,
} from './Navigation.constant';

export const actionSetCurrentScreen = (payload) => ({
  type: ACTION_SET_CURRENT_SCREEN,
  payload,
});

export const actionSetPrevScreen = (payload) => ({
  type: ACTION_SET_PREV_SCREEN,
  payload,
});
