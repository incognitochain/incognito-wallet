import { ExHandler } from '@src/services/exception';
import routeNames from '@src/router/routeNames';
import { accountSeleclor, selectedPrivacySeleclor } from '@src/redux/selectors';
import { actionSwitchAccount } from '@src/redux/actions/account';
import { setSelectedPrivacy } from '@src/redux/actions/selectedPrivacy';
import {
  actionAddFollowToken,
  actionFetchHistoryMainCrypto,
  actionFetchHistoryToken,
} from '@src/redux/actions/token';
import { CONSTANT_EVENTS } from '@src/constants';
import { logEvent } from '@services/firebase';
import { actionToggleModal } from '@src/components/Modal';
import { delay, mappingData } from './Notification.utils';
import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
  ACTION_LOAD_MORE,
  ACTION_READ_ALL,
  ACTION_DELETE,
  ACTION_READ,
  ACTION_INIT,
  ACTION_REFRESH,
  ACTION_HAS_NOTI,
  ACTION_UPDATE_RECENTLY,
} from './Notification.constant';
import {
  dataNotificationsSelector,
  notificationSelector,
} from './Notification.selector';
import {
  apiGetListNotifications,
  apiDeleteNotification,
  apiUpdateNotification,
  apiUpdateAllNotifications,
  apiInitNotifications,
} from './Notification.services';

export const actionInit = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const list = accountSeleclor.listAccount(state);
    const body = {
      Data: [
        ...list.map((item) => ({
          PublicKey: item?.PublicKeyCheckEncode,
          Wallet: item?.PaymentAddress,
          AccountName: item?.AccountName || item?.name,
        })),
      ],
    };
    const data = await apiInitNotifications(body);
    if (data) {
      await dispatch({
        type: ACTION_INIT,
      });
    }
  } catch (error) {
    throw new Error(error);
  }
};

export const actionNavigate = (item, navigation) => async (
  dispatch,
  getState,
) => {
  try {
    const { type, publicKey, tokenId, screen, screenParams } = item;
    const rootState = getState();
    const pin = rootState?.pin?.pin;
    const accountList = accountSeleclor.listAccount(rootState);
    const getPrivacyDataByTokenID = selectedPrivacySeleclor.getPrivacyDataByTokenID(
      rootState,
    );
    await dispatch(actionToggleModal());
    await logEvent(CONSTANT_EVENTS.CLICK_NOTIFICATION, { type });

    switch (type) {
    case 'broadcast': {
      navigation.navigate(routeNames.Home);
      return;
    }
    case 'reward-node':
    case 'unstake-success': {
      await delay(50);
      navigation.navigate(routeNames.Node);
      break;
    }
    case 'withdraw-coin':
    case 'withdraw-success':
    case 'balance-update':
    case 'deposit-update': {
      if (!tokenId) {
        navigation.navigate(routeNames.Wallet);
        return;
      }
      await dispatch(setSelectedPrivacy(tokenId));
      if (pin) {
        navigation.navigate(routeNames.AddPin, {
          action: 'login',
          redirectRoute: routeNames.WalletDetail,
        });
      } else {
        navigation.navigate(routeNames.WalletDetail);
      }
      const token = {
        ...getPrivacyDataByTokenID(tokenId),
        id: tokenId,
        ID: tokenId,
      };
      const accountUpdated = accountList.find(
        (item) => item.PublicKeyCheckEncode === publicKey,
      );
      await dispatch(
        actionSwitchAccount(
            accountUpdated?.AccountName || accountUpdated?.name,
        ),
      );
      if (token?.isToken && !token?.isMainCrypto) {
        await dispatch(actionAddFollowToken(tokenId));
      }
      if (token?.isMainCrypto) {
        await dispatch(actionFetchHistoryMainCrypto());
      }
      if (token?.isToken) {
        await dispatch(actionFetchHistoryToken());
      }
      break;
    }
    case 'go-to-screen': {
      const params = {};

      const rawParams = (screenParams || '').split('&');

      rawParams.forEach((param) => {
        const parts = param.split('=');
        params[parts[0]] = parts[1];
      });

      if (publicKey) {
        const accountUpdated = accountList.find(
          (item) => item.PublicKeyCheckEncode === publicKey,
        );
        await dispatch(
          actionSwitchAccount(
              accountUpdated?.AccountName || accountUpdated?.name,
          ),
        );
      }

      navigation.navigate(screen, params);
      break;
    }
    default:
      break;
    }
  } catch (error) {
    new ExHandler(error).showErrorToast();
  }
};

export const actionRefresh = () => ({
  type: ACTION_REFRESH,
});

export const actionFetching = () => ({
  type: ACTION_FETCHING,
});

export const actionFetched = (payload) => ({
  type: ACTION_FETCHED,
  payload,
});

export const actionFetchFail = () => ({
  type: ACTION_FETCH_FAIL,
});

export const actionLoadmore = () => ({
  type: ACTION_LOAD_MORE,
});

export const actionReadAll = (payload) => ({
  type: ACTION_READ_ALL,
  payload,
});

export const actionDelete = (payload) => ({
  type: ACTION_DELETE,
  payload,
});

export const actionRead = (payload) => ({
  type: ACTION_READ,
  payload,
});

export const actionHasNoti = (payload) => ({
  type: ACTION_HAS_NOTI,
  payload,
});

export const actionUpdateRecently = (payload) => ({
  type: ACTION_UPDATE_RECENTLY,
  payload,
});

export const actionFetchRead = (item) => async (dispatch) => {
  try {
    const payload = await apiUpdateNotification(item);
    if (payload) {
      return await dispatch(actionRead(item));
    }
  } catch (error) {
    new ExHandler(error).showErrorToast();
  }
};

export const actionFetchReadAll = () => async (dispatch) => {
  try {
    const payload = await apiUpdateAllNotifications();
    if (payload) {
      return await dispatch(actionReadAll(payload));
    }
  } catch (error) {
    new ExHandler(error).showErrorToast();
  }
};

export const actionFetchDelete = (item) => async (dispatch) => {
  try {
    const payload = await apiDeleteNotification(item);
    if (payload) {
      return await dispatch(actionDelete(item));
    }
  } catch (error) {
    new ExHandler(error).showErrorToast();
  }
};

export const actionFetch = (data = { loadmore: false }) => async (
  dispatch,
  getState,
) => {
  try {
    const state = getState();
    const { isFetching } = notificationSelector(state);
    if (isFetching) {
      return;
    }
    await dispatch(actionFetching());
    const {
      page: pageCurrent,
      limit,
      list: oldList,
    } = dataNotificationsSelector(state);
    const { loadmore } = data;
    const page = loadmore ? pageCurrent : 1;
    const { List, IsReadAll } = await apiGetListNotifications({
      page,
      limit,
    });
    const over = List.length < limit;
    const list = loadmore
      ? [...oldList, ...mappingData(List)]
      : [...mappingData(List)];
    await dispatch(
      actionFetched({
        list: [...new Set(list)],
        over,
        isReadAll: IsReadAll === 'true' || IsReadAll === true,
        page,
      }),
    );
  } catch (error) {
    console.log('error', error);
    // await dispatch(actionFetchFail());
    // new ExHandler(error).showErrorToast();
    // throw new Error(error);
  }
};
