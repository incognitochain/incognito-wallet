import { COLORS, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

const style = StyleSheet.create({
  container: {
    marginHorizontal: 15,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceContainer: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balance: {
    fontSize: 22,
    paddingRight: 5,
  },
  balanceSymbol: {
    fontSize: 22,
  },
  selectText: {
    fontSize: 18,
    marginLeft: 5,
  },
  desc: {
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superMedium,
    color: COLORS.black,
  },
  selectContainer: {
    borderWidth: 1,
    borderRadius: 6,
    borderColor: COLORS.lightGrey5,
    paddingRight: 30,
    paddingLeft: 10,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
    flexDirection: 'row',
  },
});

export default style;
