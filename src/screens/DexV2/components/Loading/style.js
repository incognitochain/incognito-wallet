import { StyleSheet } from 'react-native';
import { COLORS, FONT } from '@src/styles';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.overlayBlackDark,
    flex: 1,
    justifyContent: 'center',
  },
  desc: {
    color: COLORS.white,
    fontSize: FONT.SIZE.small,
    textAlign: 'center',
    width: 200,
    marginTop: 20,
    marginBottom: 10,
  },
  percent: {
    color: COLORS.white,
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 5,
    textAlign: 'center',
    marginTop: 12,
  },
});
