import { StyleSheet } from 'react-native';
import { FONT, UTILS } from '@src/styles';
import { isAndroid } from '@utils/platform';

export default StyleSheet.create({
  inputContainer: {
    marginBottom: UTILS.heightScale(8)
  },
  input: {
    fontFamily: FONT.NAME.bold,
    fontSize: 26,
    flex: 1,
    marginRight: 15,
    height: isAndroid() ? 52 : 'auto',
  },
  symbol: {
    fontSize: UTILS.heightScale(20),
    fontFamily: FONT.NAME.bold,
  },
  button: {
    marginTop: UTILS.heightScale(35),
    marginBottom: UTILS.heightScale(16),
  },
});
