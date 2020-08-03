import http from '@src/services/http';

export const apiInitNotifications = body =>
  new Promise((resolve, reject) => {
    return http
      .post('auth/public-key', body)
      .then(res => {
        resolve(res);
      })
      .catch(err => reject(err));
  });
