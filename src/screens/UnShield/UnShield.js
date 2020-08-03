import React from 'react';
import { View } from 'react-native';
import Header from '@components/Header';
import UnShieldForm from '@src/screens/SendCrypto/SendOut';
import { useSelector } from 'react-redux';
import { useNavigation } from 'react-navigation-hooks';
import { accountSeleclor, selectedPrivacySeleclor } from '@src/redux/selectors';
import { styled } from './UnShield.styled';
import withUnShield from './UnShield.enhance';

const UnShield = () => {
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const navigation = useNavigation();
  const account = useSelector(accountSeleclor.defaultAccountSelector);
  const wallet = useSelector((state) => state?.wallet);
  return (
    <View style={styled.container}>
      <Header
        titleStyled={styled.headerTitle}
        title={`Unshield ${selectedPrivacy?.externalSymbol ||
          selectedPrivacy?.symbol}`}
      />
      <UnShieldForm
        navigation={navigation}
        selectable={false}
        selectedPrivacy={selectedPrivacy}
        account={account}
        wallet={wallet}
        reloading={false}
      />
    </View>
  );
};

UnShield.propTypes = {};

export default withUnShield(UnShield);
