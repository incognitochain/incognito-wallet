import http from '@src/services/http.track_log';

export const apiGetEstimateFeeFromChain = (
  data = {
    Prv: 0,
    TokenID: null,
  },
) => http.post('chain/estimatefee', data);
