import { createSelector } from 'reselect';
import { CONSTANT_KEYS } from '@src/constants';

export const receiversSelector = createSelector(
  (state) => state.receivers,
  (receivers) => receivers,
);

export const sendInReceiversSelector = createSelector(
  receiversSelector,
  (receivers) => receivers[CONSTANT_KEYS.REDUX_STATE_RECEIVERS_IN_NETWORK],
);

export const withdrawReceiversSelector = createSelector(
  receiversSelector,
  (receivers) => receivers[CONSTANT_KEYS.REDUX_STATE_RECEIVERS_OUT_NETWORK],
);
