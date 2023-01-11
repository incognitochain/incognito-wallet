import { ACCOUNT_CONSTANT } from 'incognito-chain-web-js/build/wallet';

const MIN_TRANSACTION = 1;

export const TYPES = {
  ACTION_SET_MODAL_VISIBLE: '[PRV Funding] Set Modal Visible',
};

export const PRV_MIN_NEEDED =  MIN_TRANSACTION * ACCOUNT_CONSTANT.MAX_FEE_PER_TX; //Min [x] Transaction to cover network fee