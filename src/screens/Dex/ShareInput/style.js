import { FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  wrapper: {
    marginVertical: 15,
  },
  row: {
    flexDirection: 'row',
  },
  centerAlign: {
    alignItems: 'center',
  },
  centerJustify: {
    justifyContent: 'center',
  },
  justifyBetween: {
    justifyContent: 'space-between',
  },
  token: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bigText: {
    fontSize: 26,
    ...FONT.STYLE.bold,
  },
  inputContainer: {
    flex: 1,
    marginRight: 20,
  },
  icon: {
    width: 12,
    height: 16,
    marginLeft: 10,
  },
  input: {
    flex: 1,
  },
  symbol: {
    marginRight: 5,
  }
});
