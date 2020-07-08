import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, View, Text, ActivityIndicator, ScrollView } from '@src/components/core';
import { useNavigationParam } from 'react-navigation-hooks';
import ROUTES_NAME from '@routers/routeNames';
import { useDispatch, useSelector } from 'react-redux';
import { accountSeleclor, selectedPrivacySeleclor, settingsSelector } from '@src/redux/selectors';
import { getBalance } from '@src/redux/actions/account';
import { getBalance as getTokenBalance } from '@src/redux/actions/token';
import { PRV_ID } from '@screens/Dex/constants';
import KeepAwake from 'react-native-keep-awake';
import { COLORS, FONT } from '@src/styles';
import { Dashed } from '@src/components/Line';
import { Header } from '@src/components';
import Payment from './Payment';
import styles from './style';

const modes = [
  {
    text: 'Please make a transfer to complete \nyour order.',
    component: Payment,
  }
];
const modePaymentDevice = [
  {
    text: 'Please make a transfer to complete \nyour order.',
    component: Payment,
  },
];

const PaymentBuyNodeScreen = ({ navigation }) => {
  // Payment device
  const paymentDevice = useNavigationParam('paymentDevice');

  const [mode] = React.useState(modes[0]);
  const [reloading, setReloading] = React.useState(false);
  const origin = useNavigationParam('origin');
  const { wallet, account, selectedPrivacy } = useSelector(state => ({
    selectedPrivacy: selectedPrivacySeleclor.selectedPrivacy(state),
    account: accountSeleclor.defaultAccount(state),
    wallet: state.wallet,
    settings: settingsSelector.settings(state),
    getPrivacyDataByTokenID: selectedPrivacySeleclor.getPrivacyDataByTokenID(state),
  }));
  const dispatch = useDispatch();
  const selectable = origin !== ROUTES_NAME.WalletDetail;

  const reloadBalance = () => {
    setReloading(true);
    if (selectedPrivacy.tokenId === PRV_ID) {
      dispatch(getBalance(account));
    } else {
      dispatch(getTokenBalance(selectedPrivacy));
    }
    setReloading(false);
  };

  const Component = mode.component;

  if (!selectedPrivacy) {
    return (
      <ActivityIndicator />
    );
  }

  useEffect(() => {
    if (origin !== ROUTES_NAME.WalletDetail) {
      reloadBalance();
    }
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Payment" />
      <ScrollView style={styles.content}>
        <View style={styles.modes}>
          {modePaymentDevice.slice(0, 1)?.map(item => (
            <TouchableOpacity
              key={item.text}
              style={[styles.mode, { width: '100%'}]}
            >
              <Text style={[styles.modeText, {marginTop: 10, marginBottom: 10, color: paymentDevice ? COLORS.dark1 : 'black', fontSize: FONT.SIZE.regular, fontFamily: FONT.NAME.medium}]}>{item.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Component
          navigation={navigation}
          selectable={selectable}
          selectedPrivacy={selectedPrivacy}
          account={account}
          wallet={wallet}
          paymentDevice={paymentDevice}
          reloading={reloading}
        />
        <KeepAwake />
      </ScrollView>
    </View>
  );
};

PaymentBuyNodeScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

export default PaymentBuyNodeScreen;
