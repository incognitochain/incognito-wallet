import { ExHandler } from '@src/services/exception';
import routeNames from '@src/router/routeNames';
import { selectedPrivacySelector } from '@src/redux/selectors';
import { setSelectedPrivacy } from '@src/redux/actions/selectedPrivacy';
import { actionAddFollowToken } from '@src/redux/actions/token';
import { actionToggleModal } from '@src/components/Modal';
import { listAllMasterKeyAccounts, masterKeysSelector } from '@src/redux/selectors/masterKey';
import { switchMasterKey } from '@src/redux/actions/masterKey';
import Toast from '@components/core/Toast/Toast';
import accountService from '@services/wallet/accountService';
import { ACTION_INIT } from './Notification.constant';
import { apiInitNotifications } from './Notification.services';
import { delay } from './Notification.utils';

export const actionInit = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const list = listAllMasterKeyAccounts(state);
    const body = {
      Data: [
        ...list.map((item) => ({
          PublicKey: item?.PublicKeyCheckEncode,
          Wallet: item?.PaymentAddress,
          AccountName: item?.FullName,
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
    const masterKeys = masterKeysSelector(rootState);

    if (!masterKeys || masterKeys.length === 0) {
      return Toast.showInfo('We just upgraded key management! To continue to your old keychains, simply create a new master key first.');
    }

    const pin = rootState?.pin?.pin;
    const accountList = listAllMasterKeyAccounts(rootState);
    const getPrivacyDataByTokenID = selectedPrivacySelector.getPrivacyDataByTokenID(
      rootState,
    );
    await dispatch(actionToggleModal());

    if (publicKey) {
      const accountUpdated = accountList.find(
        (item) => item.PublicKeyCheckEncode === publicKey,
      );

      if (accountUpdated) {
        await dispatch(switchMasterKey(accountUpdated.MasterKey.name, accountService.getAccountName(accountUpdated)));
      }
    }

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
      if (token?.isToken && !token?.isMainCrypto) {
        await dispatch(actionAddFollowToken(tokenId));
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
      if (tokenId) {
        await dispatch(setSelectedPrivacy(tokenId));
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
