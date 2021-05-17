import { Toast } from '@src/components/core';
import LoadingContainer from '@src/components/LoadingContainer';
import { reloadWallet } from '@src/redux/actions/wallet';
import { getBalance as getAccountBalance } from '@src/redux/actions/account';
import { accountSelector } from '@src/redux/selectors';
import serverService from '@src/services/wallet/Server';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import storageService from '@src/services/storage';
import NetworkSetting from './NetworkSetting';

const NetworkSettingContainer = ({
  reloadWallet,
  navigation,
  getAccountBalance,
  account,
  ...props
}) => {
  const [servers, setServers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadServerList = () => {
    setIsLoading(true);
    serverService
      .get()
      .then(servers => {
        setServers(servers);

        const onReloadedNetworks = navigation.getParam('onReloadedNetworks');
        if (typeof onReloadedNetworks === 'function') {
          onReloadedNetworks();
        }

      })
      .catch(() => {
        Toast.showError('Something went wrong. Please refresh the screen.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSetDefaultNetwork = async network => {
    try {
      await serverService.setDefault(network);
      const walletDBClone = await storageService.getItem('Wallet_Clone')??'';
      const walletDB =  await storageService.getItem('Wallet') ?? '';
      await storageService.setItem('Wallet_Clone',walletDB);
      await storageService.setItem('Wallet',walletDBClone);

      Toast.showInfo('You successfully changed networks.');
    } catch {
      Toast.showError(
        'Something went wrong. Please try again.'
      );
    }
  };

  useEffect(() => {
    loadServerList();
  }, []);

  if (isLoading) {
    return <LoadingContainer />;
  }

  return (
    <NetworkSetting
      {...props}
      networks={servers}
      reloadNetworks={loadServerList}
      setDefaultNetwork={handleSetDefaultNetwork}
    />
  );
};

const mapDispatch = { reloadWallet, getAccountBalance };

const mapState = state => ({
  account: accountSelector.defaultAccount(state)
});

NetworkSettingContainer.propTypes = {
  reloadWallet: PropTypes.func.isRequired,
  setDefaultServer: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  getAccountBalance: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired,
};

export default connect(
  mapState,
  mapDispatch
)(NetworkSettingContainer);
