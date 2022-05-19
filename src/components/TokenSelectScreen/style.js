import { StyleSheet } from 'react-native';
import { FONT } from '@src/styles';

const style = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingBottom: 40,
    flex: 1
  },
  row: {
    flexDirection: 'row',
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  networkName: {
    ...FONT.STYLE.medium,
    marginRight: 5,
    fontSize: 16,
    lineHeight: 23,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontFamily: FONT.NAME.medium,
  },
  tokenName: {
    ...FONT.STYLE.medium,
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 4,
  },
});

export default style;
