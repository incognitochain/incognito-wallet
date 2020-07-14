import { StyleSheet } from 'react-native';
import { COLORS, FONT } from '@src/styles';

export default StyleSheet.create({
  group: {
    backgroundColor: COLORS.lightGrey15,
    borderRadius: 100,
    padding: 2,
  },
  button: {
    width: 160,
    borderRadius: 100,
    paddingVertical: 12,
    flex: 1,
  },
  text: {
    textAlign: 'center',
    ...FONT.STYLE.medium,
  },
  active: {
    backgroundColor: COLORS.white,
  },
  activeText: {
    color: COLORS.green3,
  },
});
