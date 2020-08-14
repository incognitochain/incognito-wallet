import { CONSTANT_CONFIGS } from '@src/constants';
import Axios from 'axios';

export const apiCheckIfValidAddressETH = (address = '') =>
  Axios.get(
    `${CONSTANT_CONFIGS.API_BASE_URL}/eta/is-eth-account?address=${address}`,
  );
