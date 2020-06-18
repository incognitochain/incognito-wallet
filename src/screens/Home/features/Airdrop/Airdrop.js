import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS, FONT, UTILS } from '@src/styles';
import { ButtonBasic } from '@src/components/Button';
import { useDispatch, useSelector } from 'react-redux';
import { actionToggleModal } from '@src/components/Modal';
import { accountSeleclor } from '@src/redux/selectors';

const styled = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    backgroundColor: COLORS.white,
    marginHorizontal: 25,
    borderRadius: 13,
    width: UTILS.deviceWidth() - 50,
    padding: 20,
    position: 'relative',
  },
  title: {
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 5,
    color: COLORS.black,
    textAlign: 'center',
    marginTop: 30,
  },
  text: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 7,
    color: COLORS.colorGreyBold,
    marginTop: 30,
  },
  btnSubmit: {
    marginVertical: 30,
  },
});

const Airdrop = () => {
  const dispatch = useDispatch();
  const defaultAccount = useSelector(accountSeleclor.defaultAccountSelector);
  return (
    <View style={styled.container}>
      <View style={styled.wrapper}>
        <Text style={styled.title}>
          0.1 PRV is on its way to{' '}
          {defaultAccount?.AccountName ||
            defaultAccount?.name ||
            'your default address'}
          .
        </Text>
        <Text style={styled.text}>
          To help you get started, this will cover fees for thousands of
          transactions. It may take a few minutes to reach you.
        </Text>
        <ButtonBasic
          title="Go incognito"
          btnStyle={styled.btnSubmit}
          onPress={() => dispatch(actionToggleModal())}
        />
      </View>
    </View>
  );
};

Airdrop.propTypes = {};

export default Airdrop;
