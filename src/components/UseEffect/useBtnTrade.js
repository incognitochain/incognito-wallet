import React from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import { useSelector } from 'react-redux';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import { CONSTANT_COMMONS } from '@src/constants';
import { ButtonBasic } from '@src/components/Button';
import routeNames from '@src/router/routeNames';
import { COLORS, FONT } from '@src/styles';

const styled = StyleSheet.create({
  btnTrade: {
    backgroundColor: COLORS.colorGrey,
    paddingHorizontal: 18,
    height: 40,
    maxWidth: 80,
  },
  titleBtnTrade: {
    color: COLORS.black,
    fontSize: FONT.SIZE.regular - 1,
    lineHeight: FONT.SIZE.regular + 4,
    fontFamily: FONT.NAME.medium,
  },
});

export const useBtnTrade = () => {
  const navigation = useNavigation();
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const hasTradeBtn =
    selectedPrivacy?.pairWithPrv &&
    selectedPrivacy?.tokenId !== CONSTANT_COMMONS.PRV.id;
  const BtnTrade = () =>
    hasTradeBtn ? (
      <ButtonBasic
        title="Trade"
        btnStyle={styled.btnTrade}
        titleStyle={styled.titleBtnTrade}
        onPress={() =>
          navigation.navigate(routeNames.Trade, {
            inputTokenId: CONSTANT_COMMONS.PRV.id,
            outputTokenId: selectedPrivacy?.tokenId,
          })
        }
      />
    ) : null;
  return [BtnTrade, hasTradeBtn];
};
