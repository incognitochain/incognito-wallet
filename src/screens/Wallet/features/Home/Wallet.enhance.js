import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useSelector, useDispatch } from 'react-redux';
import { CustomError, ErrorCode, ExHandler } from '@src/services/exception';
import {
  getPTokenList,
  getInternalTokenList,
  actionRemoveFollowToken,
} from '@src/redux/actions/token';
import { actionReloadFollowingToken } from '@src/redux/actions/account';
import { CONSTANT_COMMONS } from '@src/constants';
import { useNavigation } from 'react-navigation-hooks';
import { setSelectedPrivacy } from '@src/redux/actions/selectedPrivacy';
import routeNames from '@src/router/routeNames';
import { Toast } from '@src/components/core';
import { actionInit as actionInitEstimateFee } from '@components/EstimateFee/EstimateFee.actions';
import { isGettingBalance as isGettingBalanceSelector } from '@src/redux/selectors/shared';
import {
  unShieldStorageDataSelector,
  actionRemoveStorageData,
} from '@src/screens/UnShield';
import { KEY_SAVE } from '@src/utils/LocalDatabase';
import { withdraw } from '@src/services/api/withdraw';

export const WalletContext = React.createContext({});

const enhance = (WrappedComp) => (props) => {
  const wallet = useSelector((state) => state?.wallet);
  const isGettingBalance = useSelector(isGettingBalanceSelector);
  const txs = useSelector(unShieldStorageDataSelector)(
    KEY_SAVE.WITHDRAWAL_DATA_DECENTRALIZED,
  );
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
      getFollowingToken();
      if (reload) {
        dispatch(getPTokenList());
        dispatch(getInternalTokenList());
      }
    } catch (error) {
      new ExHandler(error).showErrorToast();
    } finally {
      await setState({ isReloading: false });
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
  const tryLastWithdrawal = async () => {
    try {
      txs.forEach(async (tx) => {
        if (tx) {
          await new Promise.all([
            withdraw(tx),
            dispatch(
              actionRemoveStorageData({
                keySave: KEY_SAVE.WITHDRAWAL_DATA_DECENTRALIZED,
                burningTxId: tx?.burningTxId,
              }),
            ),
          ]);
        }
      });
    } catch (e) {
      console.log('error', e);
    }
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
            tryLastWithdrawal,
          }}
        />
      </WalletContext.Provider>
    </ErrorBoundary>
  );
};

export default enhance;
