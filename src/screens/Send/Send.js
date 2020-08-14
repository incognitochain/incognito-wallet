import React from 'react';
import { View } from 'react-native';
import Header from '@src/components/Header';
import { useSelector } from 'react-redux';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import { withLayout_2 } from '@src/components/Layout';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { useBtnTrade } from '@src/components/UseEffect/useBtnTrade';
import { BtnInfo } from '@src/components/Button';
import SendForm from './features/Form';
import { styled } from './Send.styled';

const Send = () => {
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const navigation = useNavigation();
  const onGoBack = () => navigation.navigate(routeNames.WalletDetail);
  const [BtnTrade] = useBtnTrade();
  return (
    <View style={styled.container}>
      <Header
        titleStyled={styled.headerTitle}
        title={selectedPrivacy?.name}
        rightHeader={<BtnTrade />}
        onGoBack={onGoBack}
        customHeaderTitle={<BtnInfo />}
      />
      <SendForm />
    </View>
  );
};

Send.propTypes = {};

export default withLayout_2(Send);
