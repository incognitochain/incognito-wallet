import { COLORS, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollView: {
    marginBottom: 55,
    flex: 1,
  },
  wrapper: {
    marginTop: 20,
  },
  title: {
    paddingVertical: 15,
    fontSize: 20,
    maxWidth: '100%',
    ...FONT.STYLE.bold,
  },
  txButton: {
    flex: 1,
    flexDirection: 'row',
  },
  id: {
    flex: 1,
    paddingRight: 20,
  },
  tokenId: {
    paddingRight: 10,
  },
  ellipsis: {
    flex: 1
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  textRight: {
    textAlign: 'right',
    marginLeft: 'auto',
    flex: 1,
    ...FONT.STYLE.bold,
    fontSize: 18,
  },
  historyType: {
    color: COLORS.dark1,
    marginBottom: 5,
  },
  icon: {
    marginLeft: 10,
  },
  successful: {
    color: COLORS.green,
  },
  refunded: {
    color: COLORS.orange,
  },
  unsuccessful: {
    color: COLORS.dark1,
  },
  error: {
    color: COLORS.red,
  },
  historyStatus: {
    width: 130,
  },
  field: {
    color: COLORS.lightGrey16,
    width: 180,
    fontSize: 18,
    marginRight: 10,
    ...FONT.STYLE.medium,
  },
  button: {
    marginTop: 50,
    backgroundColor: COLORS.green3,
  },
  delete: {
    marginTop: 50,
    backgroundColor: COLORS.red,
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0,
  },
  cancelButton: {
    width: 100,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    paddingVertical: 5,
  },
});
