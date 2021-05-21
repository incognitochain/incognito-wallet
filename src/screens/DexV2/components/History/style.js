import {COLORS, FONT} from '@src/styles';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  wrapper: {
    flex: 1,
    marginBottom: 10,
  },
  button: {
    marginVertical: 50,
  },
  buttonTitle: {
    fontSize: 20,
    marginBottom: 5,
    ...FONT.STYLE.medium,
  },
  error: {
    color: COLORS.red,
  },
  bold: {
    ...FONT.STYLE.bold,
    color: COLORS.black,
  },
  content: {
    color: COLORS.lightGrey16,
  },
  historyItem: {
    marginBottom: 30,
  },
  historyTitle: {
    marginVertical: 30,
    marginBottom: 30,
  },
  right: {
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ellipsis: {
    width: '65%',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  txHash: {
    maxWidth: 200,
    marginLeft: 10
  }
});
