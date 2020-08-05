import { StyleSheet } from 'react-native';
import { COLORS, FONT } from '@src/styles';

export default StyleSheet.create({
  headerTitle: {
    color: COLORS.lightGrey1,
    fontSize: 15,
    marginBottom: 20,
  },
  output: {
    ...FONT.STYLE.bold,
    fontSize: 26,
    marginTop: 15,
    marginBottom: 30,
  },
  symbol: {
    fontSize: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginLeft: 2,
  }
});
