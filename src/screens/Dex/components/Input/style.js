import {COLORS, FONT} from '@src/styles';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  wrapper: {

  },
  inputContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  clearIconWrapper: {
    position: 'absolute',
    right: 16,
    alignSelf: 'center',
  },
  clearIcon: {
  },
  header: {
    flexDirection: 'row',
  },
  headerTitle: {
    color: COLORS.lightGrey1,
    fontSize: 15,
  },
  headerBalance: {
    flexDirection: 'row',
  },
  headerBalanceTitle: {
    fontSize: 15,
    width: 70,
  },
  balanceText: {
    fontSize: 15,
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    marginTop: 5,
    alignItems: 'center',
  },
  select: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.lightGrey5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    height: 43,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 26,
    paddingRight: 40,
    marginLeft: -3,
    height: 48,
    color: COLORS.dark1,
    ...FONT.STYLE.normal
  },
  token: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
