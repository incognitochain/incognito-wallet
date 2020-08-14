import { COLORS, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  button: {
    borderRadius: 100,
    backgroundColor: COLORS.blue5,
    height: 50,
    width: '100%',
  },
  buttonTitle: {
    fontSize: 20,
    ...FONT.STYLE.medium,
  },
});
