import { StyleSheet } from 'react-native';
import TextStyle, { scaleInApp, FontStyle } from '@src/styles/TextStyle';
import { COLORS, FONT } from '@src/styles';
import { ScreenWidth } from '@src/utils/devices';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: scaleInApp(20),
    paddingTop: 0,
  },
  item: {
    marginVertical: scaleInApp(10)
  },
  errorText: {
    ...TextStyle.minimizeText,
    textAlign: 'center',
    color: '#FF9494',
  },
  title1: {
    ...TextStyle.minimizeText,
    ...FontStyle.medium,
    color: '#101111',
    marginVertical: scaleInApp(10),
    textAlign: 'center',
  },
  title2: {
    width: '100%',
    color: COLORS.colorPrimary,
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.FONT_SIZES.superMedium,
    alignSelf: 'center',
    textAlign: 'center',
  },
  content: {
    justifyContent: 'center',
    flexDirection: 'column',
    marginTop: 50
  },
  content_step1_image: {
    width: ScreenWidth,
    height: ScreenWidth * 0.6,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  plug: {
    width: 20,
    height: 40,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginTop: 15,
    marginBottom: 15
  },
  content_step2_image: {
    alignSelf: 'center',
    resizeMode: 'contain',
    width: '100%',
    height: 70,
  },
  header: {
    marginBottom: 35,
  },
  content_step4_image: {
    alignSelf: 'center',
    resizeMode: 'contain',
    width: ScreenWidth * 0.8,
  },
  content_step3_image: {
    alignSelf: 'center',
    width: ScreenWidth * 0.8,
    resizeMode: 'contain',
    marginTop: 20,
  },
  content_step1: {
    alignSelf: 'center',
  },
  content_step1QRCode: {
    alignSelf: 'center',
    width: 30,
    height: 30,
  },
  footer: {
    marginVertical: scaleInApp(20),
    flexDirection: 'column',
  },
  button: {
    backgroundColor: '#25CDD6',
    marginHorizontal: scaleInApp(20),
    padding: scaleInApp(10),
    borderRadius: scaleInApp(4),
  },
  textTitleButton: {
    ...TextStyle.mediumText,
    ...FontStyle.medium,
    color: '#FFFFFF'
  },
  step3_text: {
    ...TextStyle.normalText,
    marginTop: 10,
    color: COLORS.colorGreyBold,
    fontFamily: FONT.NAME.medium,
    alignSelf: 'center'
  },
  item_container_input: {
    borderBottomColor: '#E5E9EA',
    borderBottomWidth: scaleInApp(1)
  },
  text: {
    ...TextStyle.normalText,
    color: COLORS.black,
    fontFamily: FONT.NAME.semiBold,
    fontSize: FONT.FONT_SIZES.superMedium,
    marginTop: 10,
  },
  item_container_error: {
    borderBottomColor: '#E5E9EA',
    borderBottomWidth: scaleInApp(1),
    paddingVertical: scaleInApp(10),
  },
  linkBtn: {
    marginTop: 25,
    color: COLORS.colorGreyBold,
    alignSelf: 'center',
    fontFamily: FONT.NAME.medium
  },
  centerText: {
    textAlign: 'center',
    marginVertical: 20,
  },
  divider: {
    width: '100%',
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey5,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
  },
  guideLine: {
    marginTop: 15,
    fontSize: 16,
    width: ScreenWidth * 0.8,
    fontFamily: FONT.NAME.medium,
    color: COLORS.colorGreyBold
  },
  bold: {
    ...FontStyle.bold,
    fontSize: 16,
    color: COLORS.colorPrimary,
  },
  icon: {
    marginHorizontal: 5,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  guide: {
    marginBottom: 25,
    marginLeft: 20,
  },
  log: {
    paddingTop: 20,
    flexDirection: 'row',
  },
  logIcon: {
    marginRight: 15,
    width: 20,
    height: 20,
    paddingTop: 3,
  },
  disabledText: {
    color: COLORS.colorPrimary,
  },
  headerRight: {
    marginRight: 15,
  }
});

export default styles;
