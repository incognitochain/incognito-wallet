import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { compose } from 'recompose';
import { withNavigation } from 'react-navigation';
import Modal, { actionToggleModal } from '@src/components/Modal';
import withFCM from '@src/screens/Notification/Notification.withFCM';
import withWallet from '@screens/Wallet/features/Home/Wallet.enhance';
import { useSelector, useDispatch, connect } from 'react-redux';
import { useIsFocused } from 'react-navigation-hooks';
import { withLayout_2 } from '@src/components/Layout';
import APIService from '@src/services/api/miner/APIService';
import { accountSeleclor } from '@src/redux/selectors';
import { ExHandler } from '@src/services/exception';
import { AppState } from 'react-native';
import AppUpdater from '@components/AppUpdater';
import { WithdrawHistory } from '@models/dexHistory';
import routeNames from '@src/router/routeNames';
import AddPin from '@screens/AddPIN';
import PropTypes from 'prop-types';
import { useBackHandler } from '@src/components/UseEffect';
import { homeSelector } from './Home.selector';
import { actionFetch as actionFetchHomeConfigs } from './Home.actions';
import Airdrop from './features/Airdrop';

const enhance = (WrappedComp) => (props) => {
  const {
    getFollowingToken,
    clearWallet,
    fetchData,
    tryLastWithdrawal,
  } = props;
  const { categories, headerTitle, isFetching } = useSelector(homeSelector);
  const isFocused = useIsFocused();
  const wallet = useSelector((state) => state?.wallet);
  const defaultAccount = useSelector(accountSeleclor.defaultAccountSelector);

  const dispatch = useDispatch();

  const getHomeConfiguration = async () => {
    try {
      await dispatch(actionFetchHomeConfigs());
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

  useBackHandler({});

  React.useEffect(() => {
    if (wallet) {
      getFollowingToken(false);
    }
  }, [wallet]);

  React.useEffect(() => {
    if (isFocused) {
      clearWallet();
    }
  }, [isFocused]);

  React.useEffect(() => {
    fetchData();
    tryLastWithdrawal();
    airdrop();
  }, []);

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
    </ErrorBoundary>
  );
};

const withPin = (WrappedComp) =>
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        appState: '',
      };
    }
    handleAppStateChange = async (nextAppState) => {
      const { pin, navigation } = this.props;
      const { appState } = this.state;
      if (appState.match(/background/) && nextAppState === 'active') {
        AppUpdater.update();
        if (pin && !WithdrawHistory.withdrawing) {
          navigation?.navigate(routeNames.AddPin, { action: 'login' });
          AddPin.waiting = false;
        }
        if (WithdrawHistory.withdrawing) {
          AddPin.waiting = true;
        }
      }
      await this.setState({ appState: nextAppState });
    };
    componentDidMount() {
      AppState.addEventListener('change', this.handleAppStateChange);
    }
    componentWillUnmount() {
      AppState.removeEventListener('change', this.handleAppStateChange);
    }
    render() {
      return <WrappedComp {...this.props} />;
    }
  };

const mapState = (state) => ({
  pin: state?.pin?.pin,
});

withPin.propTypes = {
  pin: PropTypes.any,
  navigation: PropTypes.any,
};

export default compose(
  withNavigation,
  connect(mapState),
  withFCM,
  withPin,
  withWallet,
  withLayout_2,
  enhance,
);
