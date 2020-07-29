import http from '@src/services/http';

export const apiGetNews = (params) => {
  return new Promise((resolve, reject) => {
    return http
      .get('news/list', {
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

export const apiReadNews = ({ id }) =>
  new Promise((resolve, reject) =>
    http
      .post(`news/read/${id}`)
      .then((rs) => resolve(rs))
      .catch((e) => reject(e)),
  );

export const apiRemoveNews = ({ id }) =>
  new Promise((resolve, reject) =>
    http
      .post(`news/remove/${id}`)
      .then((rs) => resolve(rs))
      .catch((e) => reject(e)),
  );

export const apiCheckUnreadNews = () => {
  return new Promise((resolve, reject) => {
    return http
      .get('news/check-unread')
      .then((rs) => resolve(rs))
      .catch((e) => reject(false));
  });
};

export const apiMarkReadAllNews = () => {
  return new Promise((resolve, reject) => {
    return http
      .post('news/check-unread')
      .then((rs) => resolve(rs))
      .catch((e) => reject(false));
  });
};
