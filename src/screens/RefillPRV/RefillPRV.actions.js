import {
  TYPES
} from './RefillPRV.constant';

const actionRefillPRVModalVisible = (isVisble) => ({
  type: TYPES.ACTION_SET_MODAL_VISIBLE,
  payload: isVisble,
});


export {
  actionRefillPRVModalVisible
};