import React from 'react';
import { View, KeyboardAvoidingView, ScrollView } from 'react-native';
import Header from '@components/Header';
import UnShieldForm from '@src/screens/SendCrypto/SendOut';
import { useSelector } from 'react-redux';
import { useNavigation } from 'react-navigation-hooks';
import { accountSeleclor, selectedPrivacySeleclor } from '@src/redux/selectors';
import { isIOS } from '@src/utils/platform';
import { useBackHandler } from '@src/components/UseEffect';
import { styled } from './UnShield.styled';
import withUnShield from './UnShield.enhance';

const UnShield = () => {
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const navigation = useNavigation();
  const account = useSelector(accountSeleclor.defaultAccountSelector);
  const wallet = useSelector((state) => state?.wallet);
  const Wrapper = isIOS() ? KeyboardAvoidingView : View;
  useBackHandler();
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Wrapper
        style={styled.container}
        contentContainerStyle={{ flex: 1 }}
        keyboardVerticalOffset={200}
        behavior="padding"
      >
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
      </Wrapper>
    </ScrollView>
  );
};

UnShield.propTypes = {};

export default withUnShield(UnShield);
