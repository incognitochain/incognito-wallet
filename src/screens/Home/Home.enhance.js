import React, { useEffect } from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { compose } from 'recompose';
import { withNavigation } from 'react-navigation';
import Modal, { actionToggleModal } from '@src/components/Modal';
import withFCM from '@src/screens/Notification/Notification.withFCM';
import withWallet from '@screens/Wallet/features/Home/Wallet.enhance';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from 'react-navigation-hooks';
import APIService from '@src/services/api/miner/APIService';
import { accountSelector } from '@src/redux/selectors';
import { ExHandler } from '@src/services/exception';
import { BackHandler } from 'react-native';
import AppUpdater from '@components/AppUpdater';
import { useBackHandler } from '@src/components/UseEffect';
import { withNews, actionCheckUnreadNews } from '@screens/News';
import {
  withSyncIncognitoAddress,
  withSyncDetectNetwork,
} from '@screens/FrequentReceivers';
import { loadAllMasterKeyAccounts } from '@src/redux/actions/masterKey';
import { masterKeysSelector } from '@src/redux/selectors/masterKey';
import withPin from '@components/pin.enhance';
import { homeSelector } from './Home.selector';
import { actionFetch as actionFetchHomeConfigs } from './Home.actions';
import Airdrop from './features/Airdrop';

const enhance = (WrappedComp) => (props) => {
  const {
    getFollowingToken,
    clearWallet,
    fetchData,
    retryLastTxsUnshieldDecentralized,
    retryLastTxsUnshieldCentralized,
  } = props;
  const { categories, headerTitle, isFetching } = useSelector(homeSelector);
  const defaultAccount = useSelector(accountSelector.defaultAccountSelector);
  const masterKeys = useSelector(masterKeysSelector);
  const dispatch = useDispatch();

  const getHomeConfiguration = async () => {
    try {
      await new Promise.all([
        dispatch(actionFetchHomeConfigs()),
        dispatch(actionCheckUnreadNews()),
      ]);
    } catch (error) {
      console.log('Fetching configuration for home failed.', error);
    }
  };
  const airdrop = async () => {
    try {
      const WalletAddress = defaultAccount?.PaymentAddress;
      const result = await APIService.airdrop1({
        WalletAddress,
      });
      if (result?.status === 1) {
        await dispatch(
          actionToggleModal({
            visible: true,
            data: <Airdrop />,
          }),
        );
      }
    } catch (e) {
      new ExHandler(e);
    }
  };

  const handleGoBack = () => BackHandler.exitApp();

  useBackHandler({ handleGoBack });

  React.useEffect(() => {
    fetchData();
    retryLastTxsUnshieldDecentralized();
    retryLastTxsUnshieldCentralized();
    airdrop();
    getFollowingToken(false);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      clearWallet();
      getHomeConfiguration();
    }, []),
  );

  useEffect(() => {
    if (masterKeys && masterKeys.length > 0) {
      dispatch(loadAllMasterKeyAccounts());
    }
  }, [masterKeys]);

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          homeProps: {
            headerTitle,
            getHomeConfiguration,
            isFetching,
            categories,
          },
        }}
      />
      <Modal />
      <AppUpdater />
    </ErrorBoundary>
  );
};

export default compose(
  withNavigation,
  withFCM,
  withPin,
  withWallet,
  withNews,
  withSyncIncognitoAddress,
  withSyncDetectNetwork,
  enhance,
);
