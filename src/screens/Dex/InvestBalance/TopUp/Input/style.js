import { StyleSheet } from 'react-native';
import { FONT, UTILS } from '@src/styles';

export default StyleSheet.create({
  inputContainer: {
    marginBottom: UTILS.heightScale(8)
  },
  input: {
    fontFamily: FONT.NAME.bold,
    fontSize: UTILS.heightScale(20),
    flex: 1,
    marginRight: 15,
  },
  symbol: {
    fontSize: UTILS.heightScale(20),
    fontFamily: FONT.NAME.bold,
  },
  button: {
    marginTop: UTILS.heightScale(40),
    marginBottom: UTILS.heightScale(25),
  },
});
