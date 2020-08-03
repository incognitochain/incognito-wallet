import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {useDispatch} from 'react-redux';
import {actionToggleModal} from '@src/components/Modal';
import {FONT, COLORS, THEME} from '@src/styles';
import {BtnClose} from '@src/components/Button';

const styled = StyleSheet.create({
  container: {
    backgroundColor: THEME.header.backgroundColor,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  title: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 6,
    color: COLORS.white,
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnClose: {
    marginLeft: 'auto',
  }
});

const Header = ({ headerTitle }) => {
  const dispatch = useDispatch();
  const handleToggleModal = async () => await dispatch(actionToggleModal());
  return (
    <View style={styled.container}>
      <View style={styled.titleContainer}>
        <Text style={styled.title}>{headerTitle}</Text>
      </View>
      <View style={styled.btnClose}>
        <BtnClose colorIcon={COLORS.white} onPress={handleToggleModal} />
      </View>
    </View>
  );
};

Header.propTypes = {};

export default Header;
