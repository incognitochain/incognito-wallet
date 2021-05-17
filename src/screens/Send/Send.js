import React from 'react';
import { View } from 'react-native';
import Header from '@src/components/Header';
import { useSelector } from 'react-redux';
import { selectedPrivacySelector } from '@src/redux/selectors';
import { withLayout_2 } from '@src/components/Layout';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import SendForm from './features/Form';
import { styled } from './Send.styled';

const Send = () => {
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const navigation = useNavigation();
  const onGoBack = () => navigation.navigate(routeNames.WalletDetail);
  
  return (
    <View style={styled.container}>
      <Header
        titleStyled={styled.headerTitle}
        title={`Send ${selectedPrivacy?.externalSymbol ||
          selectedPrivacy?.symbol}`}
        onGoBack={onGoBack}
      />
      <SendForm />
    </View>
  );
};

Send.propTypes = {};

export default withLayout_2(Send);
