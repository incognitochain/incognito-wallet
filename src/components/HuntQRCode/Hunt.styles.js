import { StyleSheet } from 'react-native';
import { COLORS, FONT } from '@src/styles';

export default StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 5,
    paddingTop: 5,
    backgroundColor: '#333335',
    borderRadius: 6,
    marginTop: 30,
    marginBottom: 50
  },
  wrapperCode: {
    padding: 15,
    backgroundColor: COLORS.white,
    borderRadius: 3
  },
  wrapperBottom: {
    height: 29,
    justifyContent: 'center',
    alignItems: 'center'
  },
  label: {
    ...FONT.STYLE.medium,
    fontSize: FONT.SIZE.regular,
    color: COLORS.white
  },
  wrapperLoading: {
    marginTop: 20
  },
  wrapperHeader: {
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  labelBold: {
    ...FONT.STYLE.bold,
    fontSize: FONT.SIZE.large,
    lineHeight: 24,
    marginBottom: 15
  },
  labelGray: {
    ...FONT.STYLE.medium,
    fontSize: 16,
    lineHeight: 21,
    color: COLORS.newGrey
  },
  arrow: {
    marginLeft: 5,
    marginTop: 2,
    tintColor: COLORS.black,
    height: 15
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
