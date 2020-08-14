import { StyleSheet } from 'react-native';
import {COLORS, FONT} from '@src/styles';

export default StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    flex: 1,
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
    minHeight: 43,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 22,
    paddingRight: 70,
    maxHeight: 55,
    marginLeft: -3,
    color: COLORS.dark1,
    ...FONT.STYLE.normal
  },
  token: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 20,
    height: 20,
    marginRight: 20,
  },
  maxButtonWrapper: {
    position: 'absolute',
    right: 16,
    alignSelf: 'center',
  },
  maxButtonTitle: {
    fontSize: 14,
    color: COLORS.primary,
  },
  maxButton: {
    backgroundColor: COLORS.transparent,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.primary,
    height: 'auto',
  },
});
