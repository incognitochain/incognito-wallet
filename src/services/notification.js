import firebase from 'react-native-firebase';
import LogManager from './LogManager';

const notifications = firebase.notifications();

export const notificationInitialize = async (store) => {
  // checkPermission();
  // registerNotificationInBackground();
  // registerWatchingNotificationOpened();
  // registerHearingNotification(store);
};

// Request permission
export const requestPermission = async () => {
  try {
    await firebase.messaging().requestPermission();
  } catch (error) {
    console.log('Err while trying to request permission: ' + error.message || '');
  }
};

// Register token
export const registerToken = async () => {
  const fcmToken = await firebase.messaging().getToken();
  if (fcmToken) {
    console.log('Token: ' + fcmToken);
  }
};

// Check permission
export const checkPermission = async () => {
  const enabled = await firebase.messaging().hasPermission();
  if (enabled && enabled) {
    await registerToken();
  } else {
    await requestPermission();
  }
};

const registerNotificationInBackground = () => {
  firebase.notifications().getInitialNotification().then(async (notificationOpen) => {
    // console.log('registerNotificationInBackground:' + LogManager.parseJsonObjectToJsonString(notificationOpen));
    if (notificationOpen) {
      // App was opened by a notification
      // Get the action triggered by the notification being opened
      //   const action = notificationOpen.action;
      // Get information about the notification that was opened
      //   let data = notificationOpen.notification?._data;
      //   const notification = notificationOpen.notification;
      //   let typeTransfer = notificationOpen.notification?._data?.type;
      // Do something for logic
    }
  });
};

// I will handle the navigation if no token valid.
const registerWatchingNotificationOpened = () => {
  var notificationOpenedListener = firebase.notifications().onNotificationOpened(async (notificationOpen) => {
    // Get information about the notification that was opened
    console.log('notificationOpenedListener: ' + LogManager.parseJsonObjectToJsonString(notificationOpen));
    if (notificationOpen.notification) {
      //   let data = notificationOpen.notification._data;
      //   let typeTransfer = notificationOpen.notification._data.type;
      //   NavigationService.navigate(RouteKeys.DetailTransactionPopup, { transfer: JSON.parse(data.payload) || null });
      // Do something for logic
      // Dismiss this notification
      // let a = normalizedData(notificationOpen.notification?.data);
      // NavigationService.navigate(a.screenParams);
      // firebase.notifications().removeDeliveredNotification(notificationOpen.notification && notificationOpen.notification._notificationId || '');
    }
  });
};

const registerHearingNotification = (store) => {
  console.log(LogManager.parseJsonObjectToJsonString(store));
  var notificationDisplayedListener = firebase.notifications().onNotificationDisplayed((notification) => {
    console.log('notificationDisplayedListener: ' + LogManager.parseJsonObjectToJsonString(notification));
    // Process your notification as required
    // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
  });
  var notificationListener = firebase.notifications().onNotification(async (notification) => {
    console.log('registerHearingNotification: ' + LogManager.parseJsonObjectToJsonString(notification));
    // Check if token is existed
    // I will check token exist here for displaying notification or not
    // Do something here ....

    // if (Platform.OS === 'android') {
    //   const channelId = new firebase.notifications.Android.Channel('Default', 'Default', firebase.notifications.Android.Importance.High);
    //   firebase.notifications().android.createChannel(channelId);
    //   let notificationDisplayed = new firebase.notifications.Notification({
    //     data: notification.data,
    //     sound: 'default',
    //     show_in_foreground: true,
    //     title: notification.title,
    //     body: notification.body,
    //   });
    //   notificationDisplayed
    //     .android.setPriority(firebase.notifications.Android.Priority.Max)
    //     .android.setChannelId('Default')
    //     .android.setVibrate(1000);
    //   firebase.notifications().displayNotification(notificationDisplayed);
    // } else {
    //   const localNotification = new firebase.notifications.Notification()
    //     .setNotificationId(notification._notificationId)
    //     .setTitle(notification._title && notification._title || '')
    //     .setBody(notification._body)
    //     .setData(notification._data);

    //   firebase.notifications().displayNotification(localNotification);
    // }

    // If want to remove every notification before, do it! by id and free
    // firebase.notifications().removeDeliveredNotification(localNotification.notificationId);
    // firebase.notifications().removeAllDeliveredNotifications();
  });


  // Handle notification in background - automatically
  firebase.messaging().onMessage((message) => {
    backgroundNotificationHandler(message)
      .then();
  });
};

export const backgroundNotificationHandler = async (message) => {
  return Promise.resolve(message);
};

/**
 * Set badge notifications
 * @param {number} badge set number of badge
 */
export const setBadge = async (badge) => {
  await notifications.setBadge(Number(badge));
};

/**
 * Reset badge notifications
 * @param {number} badge set number of badge
 */
export async function resetBadge() {
  await notifications.setBadge(Number(0));
}
