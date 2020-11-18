import http from '@services/http';

export const apiRefreshHistory = async (txID, currencyType) => {
  return new Promise((resolve, reject) => {
    return http
      .get(`eta/history/detail/${txID}`, {
        params: {
          ID: txID,
          CurrencyType: currencyType
        },
      })
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};