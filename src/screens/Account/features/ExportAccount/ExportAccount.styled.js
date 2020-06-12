import { COLORS, DECOR, FONT } from '@src/styles';
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    borderWidth: 1,
  },
  wrapper: {
    flex: 1,
    marginTop: 23,
  },
  itemContainer: {
    marginBottom: 30,
  },
  extra: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flex: 1,
  },
  hook: {
    flexDirection: 'row',
  },
  label: {
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 4,
    color: COLORS.dark1,
    fontFamily: FONT.NAME.bold,
    flex: 1,
  },
  itemData: {
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 3,
    color: COLORS.colorGreyBold,
    fontFamily: FONT.NAME.medium,
  },
  qrCode: {
    marginHorizontal: 20,
  },
  rightBlock: {
    flexBasis: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyText: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: COLORS.primary,
    textAlign: 'center',
    color: COLORS.white,
    borderRadius: DECOR.borderRadiusBorder,
    overflow: 'hidden',
    fontSize: 15,
    ...FONT.STYLE.medium,
  },

  copiableIco: {
    width: 50,
    justifyContent: 'center',
  },
  modalBackground: {
    width: width,
    height: height,
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#00000040',
  },
  modalContainer: {
    width: width,
    height: height,
    alignItems: 'center',
    alignSelf: 'center',
    alignContent: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  modalContent: {
    backgroundColor: 'white',
    justifyContent: 'center',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 12,
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    // height: 50,
    // width: 50,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  textBox: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    padding: 10,
    marginTop: 10,
  },
  title: {
    fontSize: 17,
    fontFamily: FONT.NAME.regular,
    textAlign: 'center',
  },
  copyIcon: {
    flexBasis: 20,
    paddingRight: 10,
  },
});

export default style;
