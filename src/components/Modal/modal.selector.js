import {createSelector} from 'reselect';

export const modalSelector = createSelector(
  state => state.modal,
  modal => modal,
);
