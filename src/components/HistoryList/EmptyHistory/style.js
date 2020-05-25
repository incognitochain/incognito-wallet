import { COLORS, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: COLORS.colorGreyBold,
    textAlign: 'center',
    lineHeight: FONT.NORMALIZE(FONT.FONT_SIZES.regular + 4),
    fontSize: FONT.SIZE.regular,
  },
  image: {
    marginTop: '5%',
    marginBottom: 20,
    width: 52,
    height: 60,
  },
});

export default style;
