import { COLORS, FONT } from '@src/styles';
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const style = StyleSheet.create({
  btn: {
    paddingVertical: 20,
    alignItems: 'center',
    height: 130,
    width: (width - 40) / 3,
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  image: {
    marginBottom: 3,
    height: 60,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 16,
    lineHeight: 30,
    color: COLORS.black,
    fontFamily: FONT.NAME.regular,
    textAlign: 'center',
  },
  desc: {
    fontSize: 15,
    color: COLORS.lightGrey1,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});

export default style;
