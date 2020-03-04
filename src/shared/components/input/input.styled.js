import {StyleSheet} from 'react-native';
import {FONT} from '@src/styles';

export const commonStyled = StyleSheet.create({
  container: {},
  label: {
    textTransform: 'uppercase',
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 6,
    color: '#000',
  },
  input: {
    fontFamily: FONT.NAME.default,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 6,
    color: '#000',
    padding: 0,
    margin: 0,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#D8D8D8',
  },
  labelFocused: {
    color: '#25CDD6',
  },
  error: {
    color: '#f40000',
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.small - 1,
    lineHeight: FONT.SIZE.small + 6,
  },
  inputFocused: {
    borderBottomWidth: 1,
    borderBottomColor: '#25CDD6',
  },
});
