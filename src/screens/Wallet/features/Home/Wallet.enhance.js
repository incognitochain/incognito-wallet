import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { withLayout_2 } from '@src/components/Layout';
import { compose } from 'recompose';
import { useSelector, useDispatch } from 'react-redux';
import { CustomError, ErrorCode, ExHandler } from '@src/services/exception';
import { accountSeleclor, tokenSeleclor } from '@src/redux/selectors';
import { getPTokenList, getInternalTokenList } from '@src/redux/actions/token';
import {
  getBalance,
  reloadAccountFollowingToken,
} from '@src/redux/actions/account';
import storageService from '@src/services/storage';
import { CONSTANT_KEYS, CONSTANT_COMMONS } from '@src/constants';
import { countFollowToken } from '@src/services/api/token';
import withFCM from '@src/screens/Notification/Notification.withFCM';
import { useNavigation, useIsFocused } from 'react-navigation-hooks';
import {
  setSelectedPrivacy,
  clearSelectedPrivacy,
} from '@src/redux/actions/selectedPrivacy';
import routeNames from '@src/router/routeNames';
import { actionRemoveFollowToken } from '@src/redux/actions';
import { Toast } from '@src/components/core';

export const WalletContext = React.createContext({});

const enhance = WrappedComp => props => {
  const account = useSelector(accountSeleclor.defaultAccount);
  const tokens = useSelector(tokenSeleclor.tokensFollowedSelector);
  const wallet = useSelector(state => state?.wallet);
  const dispatch = useDispatch();
  const [state, setState] = React.useState({
    isReloading: false,
  });
  const { isReloading } = state;
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const getAccountBalance = async () => {
    try {
      await dispatch(getBalance(account));
    } catch (e) {
      throw new CustomError(ErrorCode.home_load_balance_failed, {
        rawError: e,
      });
    }
  };
  const getFollowingToken = async ({ shouldLoadBalance = false } = {}) => {
    try {
      await dispatch(
        reloadAccountFollowingToken(account, {
          shouldLoadBalance,
        }),
      );
    } catch (e) {
      throw new CustomError(ErrorCode.home_load_following_token_failed, {
        rawError: e,
      });
    }
  };
  const fetchData = async (reload = false) => {
    try {
      await setState({ isReloading: true });
      let tasks = [
        getAccountBalance(),
        getFollowingToken({ shouldLoadBalance: true }),
        handleCountFollowedToken(),
      ];
      if (reload) {
        tasks = [
          ...tasks,
          await dispatch(getPTokenList()),
          await dispatch(getInternalTokenList()),
        ];
      }
      await Promise.all(tasks);
    } catch (error) {
      new ExHandler(error).showErrorToast();
    } finally {
      await setState({ isReloading: false });
    }
  };
  const handleCountFollowedToken = async () => {
    try {
      const isChecked = !!JSON.parse(
        await storageService.getItem(CONSTANT_KEYS.IS_CHECK_FOLLOWED_TOKEN),
      );
      const tokenIds = tokens.map(t => t.id);
      if (!isChecked) {
        countFollowToken(tokenIds, account?.PublicKey).catch(null);
        storageService.setItem(
          CONSTANT_KEYS.IS_CHECK_FOLLOWED_TOKEN,
          JSON.stringify(true),
        );
      }
    } catch (e) {
      new ExHandler(e);
    }
  };
  const handleExportKey = async () => {
    navigation.navigate(routeNames.ReceiveCrypto);
    await dispatch(setSelectedPrivacy(CONSTANT_COMMONS.PRV.id));
  };
  const handleSelectToken = async tokenId => {
    if (!tokenId) return;
    await dispatch(setSelectedPrivacy(tokenId));
    navigation.navigate(routeNames.WalletDetail);
  };
  const clearWallet = async () => {
    await dispatch(clearSelectedPrivacy());
  };
  const handleRemoveToken = async tokenId => {
    await dispatch(actionRemoveFollowToken(tokenId));
    Toast.showSuccess('Coin removed', { duration: 500 });
  };
  React.useEffect(() => {
    if (wallet) {
      getFollowingToken();
    }
  }, [wallet]);
  React.useEffect(() => {
    if (isFocused) {
      clearWallet();
    }
  }, [isFocused]);
  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <ErrorBoundary>
      <WalletContext.Provider
        value={{
          walletProps: {
            ...props,
            isReloading,
            fetchData,
            handleExportKey,
            handleSelectToken,
            handleRemoveToken,
          },
        }}
      >
        <WrappedComp {...props} />
      </WalletContext.Provider>
    </ErrorBoundary>
  );
};

export default compose(
  withFCM,
  withLayout_2,
  enhance,
);
