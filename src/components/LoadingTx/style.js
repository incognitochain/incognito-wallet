import { COLORS, FONT, SPACING, UTILS } from '@src/styles';
import { StyleSheet } from 'react-native';

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: {
    backgroundColor: COLORS.white,
    marginHorizontal: 25,
    borderRadius: 13,
    width: UTILS.deviceWidth() - 50,
    paddingHorizontal: 20,
    paddingVertical: 50,
    position: 'relative',
  },
  desc: {
    color: COLORS.colorGreyBold,
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 5,
    textAlign: 'center',
    marginTop: 15,
  },
  percent: {
    color: COLORS.black,
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 5,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default style;
