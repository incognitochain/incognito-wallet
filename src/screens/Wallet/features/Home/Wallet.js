import React from 'react';
import { View } from 'react-native';
import withWallet from '@screens/Wallet/features/Home/Wallet.enhance';
import Header from '@screens/Wallet/features/Home/Wallet.header';
import { styled } from '@screens/Wallet/features/Home/Wallet.styled';
import Extra from '@screens/Wallet/features/Home/Wallet.extra';
import Followed from '@screens/Wallet/features/Home/Wallet.followed';
import AddToken from '@screens/Wallet/features/Home/Wallet.addToken';

const Wallet = React.memo(() => {
  return (
    <View style={styled.container}>
      <Header />
      <Extra />
      <Followed />
      <AddToken />
    </View>
  );
});

export default withWallet(Wallet);
