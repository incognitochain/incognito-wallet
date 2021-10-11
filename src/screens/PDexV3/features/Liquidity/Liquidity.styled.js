import {StyleSheet} from 'react-native';
import {COLORS, FONT} from '@src/styles';

const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapInput: {
    marginTop: 27
  },
  wrapAMP: {
    marginBottom: 27
  },
  amp: {
    ...FONT.STYLE.bold,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 15,
  },
  selectPercentAmountContainer: {
    marginTop: 40
  },
  headerBox: {
    marginTop: 16,
    minHeight: FONT.SIZE.medium + 9,
  },
  inputBox: {
    marginTop: 16,
    marginHorizontal: 25,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.colorGrey4,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  padding: {
    paddingHorizontal: 25,
  },
  balanceStr: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.superSmall,
    lineHeight: FONT.SIZE.superSmall + 3,
    color: COLORS.colorGrey3,
  },
  btnMax: {
    height: 20,
    marginLeft: 15,
    borderRadius: 0,
    paddingHorizontal: 5,
  },
  mediumText: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
    color: COLORS.black,
    lineHeight: FONT.SIZE.medium + 9
  }
});

export default styled;
