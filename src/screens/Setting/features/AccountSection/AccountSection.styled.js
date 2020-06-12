import { COLORS, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

const HEADER_HEIGHT = 35;

export const accountSection = StyleSheet.create({
  itemWrapper: {
    backgroundColor: COLORS.white,
  },
  image: {
    resizeMode: 'contain',
    width: 30,
  },
  importButton: {},
  importButtonText: {
    color: COLORS.primary,
  },
  subItem: {
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  lastSubItem: {
    marginBottom: 0,
  },
  name: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    color: COLORS.lightGrey1,
  },
  nameTextActive: {
    color: COLORS.black,
  },
  actionBtn: {
    flexBasis: 50,
    paddingVertical: 15,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  optionMenu: {
    height: HEADER_HEIGHT,
  },
  swipeoutButton: {
    backgroundColor: COLORS.transparent,
  },
  labelStyle: {
    paddingHorizontal: 25,
  },
});
