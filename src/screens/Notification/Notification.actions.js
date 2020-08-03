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
import {
  ACTION_INIT,
} from './Notification.constant';
import {
  apiInitNotifications,
} from './Notification.services';
import { delay } from './Notification.utils';

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
