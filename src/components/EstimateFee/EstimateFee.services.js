import Axios from 'axios';
import { CONSTANT_CONFIGS } from '@src/constants';
import http2 from '@src/services/http2';

export const apiCheckIfValidAddressETH = (address = '') =>
  Axios.get(
    `${CONSTANT_CONFIGS.API_BASE_URL}/eta/is-eth-account?address=${address}`,
  );

export const apiCheckValidAddress = (address = '', currencyType = null) =>
  Axios.get(
    `${CONSTANT_CONFIGS.API_BASE_URL}/ota/valid/${currencyType}/${address}`,
  );
