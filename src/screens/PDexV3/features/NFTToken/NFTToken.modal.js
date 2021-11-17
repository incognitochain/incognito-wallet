import React from 'react';
import { StyleSheet } from 'react-native';
import { PureModalContent } from '@src/components/Modal/features/PureModal';
import { Text, Image, View } from '@src/components/core';
import { ButtonTrade } from '@src/components/Button';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { COLORS, FONT } from '@src/styles';
import { actionToggleModal } from '@src/components/Modal';
import nftSrc from '@assets/images/new-icons/nft.png';
import { useDispatch } from 'react-redux';

const styled = StyleSheet.create({
  title: {
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 5,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  desc: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 5,
    color: COLORS.colorGrey3,
    textAlign: 'center',
  },
});

const NFTTokenModal = () => {
  const navigate = useNavigation();
  const dispatch = useDispatch();
  return (
    <PureModalContent>
      <View
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image source={nftSrc} style={{ width: 40, height: 40 }} />
      </View>
      <Text style={styled.title}>Mint a ticket to continue.</Text>
      <Text style={styled.desc}>
        {`You don't have any spare tickets to anonymize this transaction. Wait for
        one to free up, or mint another.`}
      </Text>
      <ButtonTrade
        btnStyle={{
          marginTop: 24,
          marginBottom: 0,
          borderRadius: 8,
          backgroundColor: COLORS.black,
        }}
        title="Mint"
        onPress={() => {
          dispatch(actionToggleModal({ visible: false, data: null }));
          navigate.navigate(routeNames.NFTToken);
        }}
      />
    </PureModalContent>
  );
};

NFTTokenModal.propTypes = {};

export default React.memo(NFTTokenModal);
