import http from '@src/services/http';

export const apiGetListNotifications = (params) => {
  return new Promise((resolve, reject) => {
    return http
      .get('notifications/list', {
        params,
      })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const apiInitNotifications = (body) =>
  new Promise((resolve, reject) => {
    return http
      .post('auth/public-key', body)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => reject(err));
  });

export const apiDeleteNotification = ({ id }) => {
  return new Promise((resolve, reject) => {
    return http
      .delete(`notifications/${id}`)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => reject(err));
  });
};

export const apiUpdateNotification = ({ id }) =>
  new Promise((resolve, reject) => {
    return http
      .put(`notifications/${id}`)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => reject(err));
  });

export const apiUpdateAllNotifications = () =>
  new Promise((resolve, reject) => {
    return http
      .patch('notifications/read-all')
      .then((res) => {
        resolve(res);
      })
      .catch((err) => reject(err));
  });

export const apiGetNews = () =>
  new Promise((resolve, reject) => {
    return http
      .put('news/list')
      .then((res) => {
        resolve(res);
      })
      .catch((err) => reject(err));
  });
