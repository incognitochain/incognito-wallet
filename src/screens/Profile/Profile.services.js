import http from '@src/services/http';

export const apiGetProfile = () =>
  new Promise((resolve, reject) =>
    http
      .get('auth/profile')
      .then((rs) => resolve(rs))
      .catch((e) => reject(e)),
  );
