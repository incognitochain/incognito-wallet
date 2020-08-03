import { StyleSheet } from 'react-native';
import { FONT, COLORS, UTILS } from '@src/styles';
import { isAndroid } from '@utils/platform';

export default StyleSheet.create({
  flex: {
    flex: 1,
  },
  coinContainer: {
    marginTop: UTILS.heightScale(30),
    flex: 1,
  },
  coin: {
    marginBottom: UTILS.heightScale(20),
  },
  coinName: {
    fontFamily: FONT.NAME.bold,
    fontSize: 20,
    marginBottom: UTILS.heightScale(8),
  },
  coinInterest: {
    fontSize: 18,
    color: COLORS.green2,
    fontFamily: FONT.NAME.medium,
    marginBottom: UTILS.heightScale(8),
  },
  coinExtra: {
    fontFamily: FONT.NAME.medium,
    color: COLORS.newGrey,
    fontSize: 18,
    marginBottom: UTILS.heightScale(8),
  },
  textRight: {
    textAlign: 'right',
  },
  justifyRight: {
    justifyContent: 'flex-end',
  },
  button: {
    backgroundColor: COLORS.green2,
  },
  error: {
    color: COLORS.red,
    fontSize: 16,
    minHeight: 20,
  },
  disabled: {
    opacity: 0.5,
  },
  input: {
    fontFamily: FONT.NAME.bold,
    fontSize: 26,
    height: isAndroid() ? 52 : 'auto',
    padding: 0,
    flex: 1,
    marginRight: 15,
    marginBottom: isAndroid() ? -UTILS.heightScale(8) : 0,
  },
  inputContainer: {
    marginBottom: UTILS.heightScale(8)
  },
  symbol: {
    fontSize: UTILS.heightScale(20),
    fontFamily: FONT.NAME.bold,
  },
});
