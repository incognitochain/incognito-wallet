import {COLORS, FONT} from '@src/styles';
import { StyleSheet } from 'react-native';

export const dexStyle = StyleSheet.create({
  actionContainer: {
    flex: 1,
  },
  options: {
    minHeight: 55,
    minWidth: 45,
  },
  header: {
    marginHorizontal: 25,
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  mode: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeText: {
    marginTop: 10,
    color: COLORS.white,
  },
  scrollViewContainer: {
    flex: 1,
    padding: 15,
  },
  active: {
    color: COLORS.primary,
    ...FONT.STYLE.medium,
  }
});

export const mainStyle = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.lightGrey6,
  },
  componentWrapper: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingTop: 15,
    paddingBottom: 10,
    height: 'auto',
    backgroundColor: COLORS.dark2,
  },
  headerTitle: {
    fontSize: 20,
    color: COLORS.white,
    ...FONT.STYLE.medium,
    marginVertical: 20,
    marginLeft: 20,
  },
  logo: {
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    color: COLORS.white,
    marginLeft: 'auto',
    marginRight: 'auto',
    ...FONT.STYLE.bold,
    marginVertical: 20,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGrey6,
    position: 'relative',
  },
  modes: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 240,
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: 6,
  },
  mode: {
    flex: 1,
    paddingVertical: 10,
    textAlign: 'center',
    alignItems: 'center',
    borderRadius: 6,
    overflow: 'hidden',
  },
  modeText: {
    color: COLORS.white,
    fontSize: 16,
    ...FONT.STYLE.medium,
  },
  modeActive: {
    backgroundColor: COLORS.primary,
  },
  dottedDivider: {
    height: 10,
    marginTop: 10,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey5,
    borderRadius: 1,
  },
  content: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 6,
  },
  arrowWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  arrow: {
    marginHorizontal: 7.5,
    height: 40,
    resizeMode: 'contain',
  },
  divider: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.lightGrey5,
  },
  fee: {
    marginTop: 5,
    fontSize: 14,
  },
  estimateFee: {
    marginBottom: 10,
  },
  feeWrapper: {

  },
  twoColumns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textLeft: {
    textAlign: 'left',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
  },
  disabledButton: {
    backgroundColor: COLORS.lightGrey2,
  },
  depositButton: {
    marginRight: 5,
    marginLeft: 0,
    backgroundColor: COLORS.green,
  },
  depositText: {
    marginLeft: 10,
    ...FONT.STYLE.medium,
  },
  withdrawButton: {
    marginLeft: 7.5,
    flex: 1,
  },
  column: {
    flex: 1
  },
  textRight: {
    textAlign: 'right',
    marginLeft: 'auto',
  },
  accountBalance: {
    marginTop: 0,
    maxWidth: 100,
    color: COLORS.dark1,
  },
  accountName: {
    maxWidth: 80,
  },
  longAccountName: {
    maxWidth: 120,
  },
  error: {
    fontSize: 15,
    color: COLORS.red,
    marginTop: 5,
    marginBottom: 5,
  },
  modal: {
    margin: 0,
    padding: 0,
    minWidth: 320,
    borderRadius: 8,
    height: 'auto',
  },
  modalHeader: {
    backgroundColor: COLORS.dark2,
    paddingLeft: 40,
    paddingRight: 25,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalHeaderText: {
    fontSize: 18,
    ...FONT.STYLE.medium,
    color: COLORS.white,
    textAlign: 'center',
    marginLeft: 30,
    marginRight: 30,
    flex: 1,
  },
  closeIcon: {
    marginLeft: 'auto',
  },
  modalBack: {
    position: 'absolute',
    left: 30,
  },
  modalContent: {
    maxHeight: 400,
    paddingHorizontal: 25,
  },
  longContent: {
    maxHeight: 800,
    paddingHorizontal: 25,
  },
  padding: {
    marginTop: 5,
  },
  paddingTop: {
    paddingTop: 25,
  },
  modalEstimate: {
  },
  modalItem: {
    paddingVertical: 15,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey5,
    alignItems: 'center',
    minHeight: 70,
  },
  lastItem: {
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  actionsWrapper: {
    marginTop: 15,
  },
  accountIcon: {
    marginRight: 10,
  },
  hidden: {
    display: 'none',
    opacity: 0,
  },
  hiddenDialog: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  tokenIcon: {
    paddingRight: 10,
  },
  priceHistoryContainer: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  priceHistoryText: {
    textAlign: 'center',
    color: COLORS.primary,
    ...FONT.STYLE.medium
  },
});

export const inputStyle = StyleSheet.create({
  wrapper: {

  },
  inputContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  clearIcon: {
    position: 'absolute',
    right: 16,
    top: 18,
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
    maxWidth: 80,
    marginRight: 5,
  },
  balanceText: {
    fontSize: 15,
    maxWidth: 170,
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
    maxHeight: 55,
    marginLeft: -3,
    color: COLORS.dark1,
    ...FONT.STYLE.normal
  },
  token: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export const modalStyle = StyleSheet.create({
  dialog: {
    borderRadius: 8,
    height: 'auto',
    paddingTop: 20,
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: 10,
    paddingHorizontal: 25,
  },
  closeButton: {
    marginLeft: 'auto',
    marginRight: 10,
  },
  container: {
    maxHeight: 300,
    paddingHorizontal: 25,
  },
  search: {
    marginHorizontal: 25,
    marginBottom: 15,
    backgroundColor: COLORS.lightGrey6,
    paddingHorizontal: 20,
    flex: 0,
    paddingVertical: 5,
  },
  transferSearch: {
    marginVertical: 20,
  },
  token: {
    flexDirection: 'row',
    borderBottomColor: COLORS.lightGrey5,
    borderBottomWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  tokenInfo: {
    marginLeft: 10,
  },
  tokenName: {
    color: COLORS.lightGrey1,
    marginTop: 10,
    fontSize: 14,
    lineHeight: 18,
  },
  tokenSymbol: {
    color: COLORS.dark1,
    fontSize: 14,
    lineHeight: 18,
  },
});

export const tokenStyle = StyleSheet.create({
  wrapper: {
    marginTop: 10,
  },
  logo: {
    paddingRight: 20,
  },
  symbol: {
    color: COLORS.dark1,
    marginLeft: 5,
  },
  small: {
    fontSize: 14,
  },
  name: {
    color: COLORS.lightGrey1,
    marginLeft: 5,
  },
  modalName: {
    marginTop: 5,
  },
  input: {
    marginTop: 50,
    ...FONT.STYLE.normal,
    fontSize: 26,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey5,
    paddingVertical: 5,
    color: COLORS.dark1,
  },
  error: {
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'center',
  },
  button: {
    marginVertical: 15,
    marginBottom: 25,
  },
  loading: {
    marginLeft: 10,
  },
  centerHeader: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  fee: {
    fontSize: 14,
    textAlign: 'center',
  },
  feeWrapper: {
    marginTop: 10,
    marginBottom: 30,
    textAlign: 'center',
    minHeight: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feeContainer: {
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    marginLeft: 10,
  },
  transferSuccessButton: {
    marginTop: 30,
    width: '100%',
  }
});
