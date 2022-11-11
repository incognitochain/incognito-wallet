import { StyleSheet } from 'react-native';
import TextStyle, { scaleInApp, FontStyle } from '@src/styles/TextStyle';
import { COLORS, FONT } from '@src/styles';
import { ScreenWidth } from '@src/utils/devices';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: scaleInApp(20),
    paddingTop: 0,
    flexDirection: 'column',
  },
  item: {
    marginVertical: scaleInApp(5)
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
    color: COLORS.black,
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superMedium,
    alignSelf: 'center',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 40,
  },
  content: {
    margin: scaleInApp(20),
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column'
  },
  content_step1_image: {
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  content_step2_image: {
    alignSelf: 'center',
    resizeMode: 'contain',
    width: '100%',
    height: 70,
  },
  content_step4_image: {
    alignSelf: 'center',
    resizeMode: 'contain',
    width: ScreenWidth * 0.8,
    height: ScreenWidth * 0.3,
  },
  content_step3_image: {
    alignSelf: 'center',
    resizeMode: 'contain',
    marginTop: 20,
  },
  content_step1: {
    alignSelf: 'center'
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
    color: '#101111',
    alignSelf: 'center'
  },
  item_container_input: {
    borderBottomColor: '#E5E9EA',
    borderBottomWidth: scaleInApp(1)
  },
  text: {
    ...TextStyle.normalText,
    color: '#1C1C1C',
  },
  item_container_error: {
    borderBottomColor: '#E5E9EA',
    borderBottomWidth: scaleInApp(1),
    paddingVertical: scaleInApp(10),
  },
  linkBtn: {
    marginVertical: 15,
    color: COLORS.primary,
    alignSelf: 'center',
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
    fontSize: 14,
  },
  bold: {
    ...FontStyle.bold,
    fontSize: 14,
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
    color: COLORS.colorGreyMedium,
  },
  headerRight: {
    marginRight: 15,
  }
});

export default styles;
