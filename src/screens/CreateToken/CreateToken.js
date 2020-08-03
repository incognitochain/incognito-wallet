import AddInternalToken from '@src/components/AddInternalToken';
import Header from '@src/components/Header';
import React from 'react';
import { withLayout_2 } from '@src/components/Layout';
import { View } from 'react-native';
import { styled } from './CreateToken.styled';

const CreateToken = () => {
  return (
    <View style={styled.container}>
      <Header title="Mint a privacy coin" />
      <AddInternalToken />
    </View>
  );
};

CreateToken.propTypes = {};

export default withLayout_2(CreateToken);
