import { FONT, THEME, COLORS } from '@src/styles';
import { StyleSheet } from 'react-native';

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
  },
  verifyInfoContainer: {
    // marginTop: 25,
  },
  verifyInfoHeader: {
    flexDirection: 'row',
  },
  verifyInfoLabel: {
    fontSize: 14,
    marginBottom: 10,
    marginLeft: 10,
    top: -2,
    // fontStyle: 'italic'
  },
  block: {
    backgroundColor: COLORS.white,
    paddingVertical: 15,
    marginBottom: 10,
  },
  desc: {
    marginBottom: 10,
  },
  input: {
    // marginBottom: 15,
  },
  descriptionInput: {
    height: 80,
  },
  submitBtn: {
    marginTop: 40,
    borderRadius: 20,
    backgroundColor: COLORS.orange,
  },
  submitBtnDisabed: {
    opacity: 0.5,
  },
  title: {
    fontSize: THEME.text.largeTitleSize,
    fontWeight: 'bold',
  },
  balance: {
    textAlign: 'center',
  },
  error: {
    color: COLORS.red,
    fontSize: FONT.SIZE.small,
  },
  showMyAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  showMyAddressLabel: {
    flex: 1,
    fontSize: FONT.SIZE.regular,
    fontFamily: FONT.NAME.regular,
    lineHeight: FONT.NORMALIZE(FONT.SIZE.regular + 4),
    color: COLORS.black,
  },
  switch: {
    height: '100%',
    marginBottom: 0,
  },
  ownerAddressContainer: {
    alignItems: 'flex-start',
  },
  ownerAddressLabel: {
    marginBottom: 10,
    fontSize: FONT.SIZE.regular,
    fontFamily: FONT.NAME.regular,
    lineHeight: FONT.NORMALIZE(FONT.SIZE.regular + 4),
    color: COLORS.black,
  },
  ownerAddressValue: {
    paddingHorizontal: 1,
    fontSize: FONT.SIZE.regular,
    fontFamily: FONT.NAME.regular,
    lineHeight: FONT.NORMALIZE(FONT.SIZE.regular + 4),
    color: COLORS.colorGreyBold,
  },
});

export default style;
