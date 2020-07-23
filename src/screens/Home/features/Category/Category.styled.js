import { StyleSheet } from 'react-native';
import { FONT, COLORS } from '@src/styles';

export const styled = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  title: {
    fontSize: 25,
    lineHeight: 30,
    fontFamily: FONT.NAME.bold,
    color: COLORS.black,
  },
  hook: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
