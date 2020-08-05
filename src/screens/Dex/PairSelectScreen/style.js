import { StyleSheet } from 'react-native';
import { COLORS, FONT } from '@src/styles';

const style = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingBottom: 80,
  },
  row: {
    flexDirection: 'row',
    paddingBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: COLORS.black,
    fontFamily: FONT.NAME.medium,
  },
  pairItem: {
    marginBottom: 30,
  },
  pairName: {
    ...FONT.STYLE.bold,
    fontSize: 20,
    lineHeight: 24,
  },
  pairShare: {
    ...FONT.STYLE.bold,
    fontSize: 20,
    lineHeight: 24,
  },
});

export default style;
