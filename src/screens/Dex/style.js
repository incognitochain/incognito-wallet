import { StyleSheet } from 'react-native';
import { FONT, COLORS, UTILS } from '@src/styles';

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
    fontSize: 18,
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
  button: {
    backgroundColor: COLORS.green3,
  },
  error: {
    color: COLORS.red,
    fontSize: 16,
    minHeight: 20,
  },
  disabled: {
    opacity: 0.5,
  },
  margin: {
    marginHorizontal: 5,
  },
  info: {
    fontSize: 18,
    marginBottom: UTILS.heightScale(5),
  }
});
