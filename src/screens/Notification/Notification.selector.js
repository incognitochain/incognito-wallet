import {createSelector} from 'reselect';

export const notificationSelector = createSelector(
  state => state.notification.notification,
  notification => notification,
);

export const dataNotificationsSelector = createSelector(
  notificationSelector,
  notification => notification.data,
);

export const recentlyNotificationSelector = createSelector(
  notificationSelector,
  notification => notification.recently,
);
