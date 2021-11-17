import { COLORS, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

export const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  dividerStyled: {
    marginVertical: 30,
  },
  scrollview: {
    paddingVertical: 24,
  },
  inputGroups: {
    marginVertical: 30,
  },
  subText: {
    fontSize: FONT.SIZE.superSmall,
    fontFamily: FONT.NAME.regular,
    color: COLORS.colorGrey3,
    textAlign: 'center'
  },
});
