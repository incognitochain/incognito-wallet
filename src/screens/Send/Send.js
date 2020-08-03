import React from 'react';
import { View, KeyboardAvoidingView, ScrollView } from 'react-native';
import Header from '@src/components/Header';
import { useSelector } from 'react-redux';
import { selectedPrivacySeleclor, accountSeleclor } from '@src/redux/selectors';
import { withLayout_2 } from '@src/components/Layout';
import SendForm from '@screens/SendCrypto/SendIn';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { BtnQuestionDefault } from '@src/components/Button';
import NavigationService from '@src/services/NavigationService';
import { styled } from './Send.styled';

const Send = () => {
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const navigation = useNavigation();
  const account = useSelector(accountSeleclor.defaultAccountSelector);
  const wallet = useSelector((state) => state?.wallet);
  const onGoBack = () => navigation.navigate(routeNames.WalletDetail);
  return (
    <View style={styled.container}>
      <Header
        titleStyled={styled.headerTitle}
        title={`Send ${selectedPrivacy?.externalSymbol ||
          selectedPrivacy?.symbol}`}
        rightHeader={(
          <BtnQuestionDefault
            onPress={() => {
              NavigationService.navigate(routeNames.WhySend);
            }}
          />
        )}
        onGoBack={onGoBack}
      />
      <SendForm
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

Send.propTypes = {};

export default withLayout_2(Send);
