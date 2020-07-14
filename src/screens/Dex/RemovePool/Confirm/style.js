import  {COLORS, FONT, UTILS } from '@src/styles';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  button: {
    marginVertical: UTILS.heightScale(38),
  },
  buttonTitle: {
    fontSize: 20,
    ...FONT.STYLE.medium,
  },
  error: {
    color: COLORS.red,
  },
  bigText: {
    color: COLORS.green3,
    fontSize: 40,
    lineHeight: 55,
    ...FONT.STYLE.bold,
  },
  mainInfo: {
    marginVertical: UTILS.heightScale(38),
  },
  bold: {
    ...FONT.STYLE.bold,
    color: COLORS.black,
  },
  extra: {
    color: COLORS.lightGrey17,
    fontSize: 18,
  },
  warning: {
    color: COLORS.orange,
  },
  row: {
    flexDirection: 'row'
  },
});
