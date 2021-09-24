import { COLORS, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

const style = StyleSheet.create({
  container: {
    marginTop: 30,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
  },
  label: {
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 4,
    color: COLORS.black,
  },
  input: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 4,
    color: COLORS.colorGreyBold,
    marginRight: 5,
    padding: 0,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionBtn: {
    flex: 1,
    height: 45,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 0,
    justifyContent: 'center'
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  selectBox: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center'
  },
  selectedBtn: {
    backgroundColor: '#EFEFEF',
  },
  unSelectBtn: {
    borderColor: COLORS.colorGreyLight,
  },
  textSelectBox: {
    color: COLORS.colorGreyBold,
    fontFamily: FONT.NAME.specialMedium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.medium + 4,
    marginLeft: 10,
  },
});

export default style;
