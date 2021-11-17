import { StyleSheet } from 'react-native';
import { COLORS, FONT } from '@src/styles';

export default StyleSheet.create({
  container: {
    backgroundColor: COLORS.white
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    marginBottom: 30,
  },
  title: {
    ...FONT.STYLE.bold,
    color: COLORS.black,
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  message: {
    ...FONT.STYLE.medium,
    color: COLORS.newGrey,
    fontSize: 16,
    textAlign: 'center',
  },
});
