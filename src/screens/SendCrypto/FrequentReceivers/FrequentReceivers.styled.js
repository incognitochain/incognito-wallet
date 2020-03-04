import {StyleSheet} from 'react-native';
import {FONT, COLORS} from '@src/styles';

export const styled = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    marginTop: 20,
  },
  label: {
    textTransform: 'none',
  },
  tip: {
    textAlign: 'center',
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 6,
    color: COLORS.lightGrey1,
    marginVertical: 40,
    paddingHorizontal: 40,
  },
});
