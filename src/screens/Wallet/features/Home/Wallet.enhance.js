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
import { CONSTANT_COMMONS, CONSTANT_KEYS } from '@src/constants';
import { useNavigation } from 'react-navigation-hooks';
import { setSelectedPrivacy } from '@src/redux/actions/selectedPrivacy';
import routeNames from '@src/router/routeNames';
import { Toast } from '@src/components/core';
import { actionInit as actionInitEstimateFee } from '@components/EstimateFee/EstimateFee.actions';
import { isGettingBalance as isGettingBalanceSelector } from '@src/redux/selectors/shared';
import {
  unShieldStorageDataSelector,
  actionRemoveStorageDataDecentralized,
  actionRemoveStorageDataCentralized,
} from '@src/screens/UnShield';
import { withdraw, updatePTokenFee } from '@src/services/api/withdraw';
import { accountSeleclor } from '@src/redux/selectors';

export const WalletContext = React.createContext({});

const enhance = (WrappedComp) => (props) => {
  const wallet = useSelector((state) => state?.wallet);
  const isGettingBalance = useSelector(isGettingBalanceSelector);
  const unshieldStorage = useSelector(unShieldStorageDataSelector);
  const signPublicKeyEncode = useSelector(
    accountSeleclor.signPublicKeyEncodeSelector,
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
  const retryLastTxsUnshieldDecentralized = async () => {
    try {
      const keyUnshieldDecentralized =
        CONSTANT_KEYS.UNSHIELD_DATA_DECENTRALIZED;
      const txs = unshieldStorage[keyUnshieldDecentralized]?.txs || [];
      txs &&
        txs.map(async (tx) => {
          if (tx) {
            dispatch(
              actionRemoveStorageDataDecentralized({
                keySave: keyUnshieldDecentralized,
                burningTxId: tx?.burningTxId,
              }),
            );
            withdraw({ ...tx, signPublicKeyEncode });
          }
        });
    } catch (e) {
      console.log('error', e);
    }
  };
  const retryLastTxsUnshieldCentralized = async () => {
    try {
      const keyUnshieldCentralized = CONSTANT_KEYS.UNSHIELD_DATA_CENTRALIZED;
      const txs = unshieldStorage[keyUnshieldCentralized]?.txs || [];
      txs &&
        txs.map(async (tx) => {
          if (tx) {
            dispatch(
              actionRemoveStorageDataCentralized({
                keySave: keyUnshieldCentralized,
                txId: tx?.txId,
              }),
            );
            updatePTokenFee({ ...tx, signPublicKeyEncode });
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
            retryLastTxsUnshieldDecentralized,
            retryLastTxsUnshieldCentralized,
          }}
        />
      </WalletContext.Provider>
    </ErrorBoundary>
  );
};

export default enhance;
