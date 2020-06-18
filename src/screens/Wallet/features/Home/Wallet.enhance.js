import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useSelector, useDispatch } from 'react-redux';
import { CustomError, ErrorCode, ExHandler } from '@src/services/exception';
import { accountSeleclor, tokenSeleclor } from '@src/redux/selectors';
import {
  getPTokenList,
  getInternalTokenList,
  actionRemoveFollowToken,
} from '@src/redux/actions/token';
import { actionReloadFollowingToken } from '@src/redux/actions/account';
import storageService from '@src/services/storage';
import { CONSTANT_KEYS, CONSTANT_COMMONS } from '@src/constants';
import { countFollowToken } from '@src/services/api/token';
import { useNavigation } from 'react-navigation-hooks';
import { setSelectedPrivacy } from '@src/redux/actions/selectedPrivacy';
import routeNames from '@src/router/routeNames';
import { Toast } from '@src/components/core';
import { actionInit as actionInitEstimateFee } from '@components/EstimateFee/EstimateFee.actions';
import { isGettingBalance as isGettingBalanceSelector } from '@src/redux/selectors/shared';

export const WalletContext = React.createContext({});

const enhance = (WrappedComp) => (props) => {
  const account = useSelector(accountSeleclor.defaultAccount);
  const tokens = useSelector(tokenSeleclor.tokensFollowedSelector);
  const wallet = useSelector((state) => state?.wallet);
  const isGettingBalance = useSelector(isGettingBalanceSelector);
  const dispatch = useDispatch();
  const [state, setState] = React.useState({
    isReloading: false,
  });
  const { isReloading } = state;
  const navigation = useNavigation();
  const getFollowingToken = async (shouldLoadBalance = true) => {
    try {
      await setState({ isReloading: true });
      await dispatch(actionReloadFollowingToken(shouldLoadBalance));
    } catch (e) {
      throw new CustomError(ErrorCode.home_load_following_token_failed, {
        rawError: e,
      });
    } finally {
      await setState({ isReloading: false });
    }
  };
  const fetchData = async (reload = false) => {
    try {
      await setState({ isReloading: true });
      let tasks = [getFollowingToken(), handleCountFollowedToken()];
      if (reload) {
        tasks = [
          ...tasks,
          dispatch(getPTokenList()),
          dispatch(getInternalTokenList()),
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
      const tokenIds = tokens.map((t) => t.id);
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
  const handleSelectToken = async (tokenId) => {
    if (!tokenId) return;
    await dispatch(setSelectedPrivacy(tokenId));
    navigation.navigate(routeNames.WalletDetail);
  };
  const clearWallet = async () => await dispatch(actionInitEstimateFee());
  const handleRemoveToken = async (tokenId) => {
    await dispatch(actionRemoveFollowToken(tokenId));
    Toast.showSuccess('Add coin again to restore balance.', {
      duration: 500,
    });
  };
  return (
    <ErrorBoundary>
      <WalletContext.Provider
        value={{
          walletProps: {
            ...props,
            wallet,
            isReloading,
            fetchData,
            handleExportKey,
            handleSelectToken,
            handleRemoveToken,
            clearWallet,
            getFollowingToken,
          },
        }}
      >
        <WrappedComp
          {...{
            ...props,
            wallet,
            isReloading: !!isReloading || isGettingBalance.length > 0,
            fetchData,
            handleExportKey,
            handleSelectToken,
            handleRemoveToken,
            clearWallet,
            getFollowingToken,
          }}
        />
      </WalletContext.Provider>
    </ErrorBoundary>
  );
};

export default enhance;
