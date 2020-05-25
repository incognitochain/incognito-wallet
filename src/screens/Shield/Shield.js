import React from 'react';
import { View, FlatList } from 'react-native';
import Header from '@src/components/Header';
import { BtnQuestionDefault } from '@src/components/Button';
import PropTypes from 'prop-types';
import { TokenBasic as Token } from '@src/components/Token';
import { styled } from './Shield.styled';
import withShield from './Shield.enhance';

const Shield = props => {
  const { data, handleWhyShield, handleShield } = props;
  return (
    <View style={styled.container}>
      <Header
        title="Select a coin to shield"
        canSearch
        rightHeader={<BtnQuestionDefault onPress={handleWhyShield} />}
      />
      <FlatList
        style={styled.flatList}
        data={[...data]}
        renderItem={({ item }) => (
          <Token
            externalSymbol
            onPress={() => handleShield(item?.tokenId)}
            tokenId={item?.tokenId}
            symbol="externalSymbol"
          />
        )}
        keyExtractor={token => token?.tokenId}
        extraData={[...data]}
      />
    </View>
  );
};

Shield.propTypes = {
  data: PropTypes.array.isRequired,
  handleWhyShield: PropTypes.func.isRequired,
  handleShield: PropTypes.func.isRequired,
};

export default withShield(Shield);
