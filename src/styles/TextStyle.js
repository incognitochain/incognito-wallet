import { Dimensions, StatusBar, StyleSheet } from 'react-native';
import colors from './colors';
import DECOR from './decor';
// eslint-disable-next-line import/no-cycle
import font from './font';

export const STATUSBAR_HEIGHT = StatusBar.currentHeight || 20;

export const screenSize = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height - STATUSBAR_HEIGHT
};
export const scaleInApp = DECOR.scaleInApp;

export const FontStyle = {
  ...font.STYLE
};
const textColor = colors.white;
const TextStyle = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 5,
    height: 42,
    justifyContent: 'center',
    padding: 7
  },
  buttonText: {
    ...FontStyle.normal,
    color: textColor,
    fontSize: scaleInApp(16)
  },
  xExtraText: {
    ...FontStyle.normal,
    color: textColor,
    fontSize: scaleInApp(26)
  },
  xxExtraText: {
    ...FontStyle.normal,
    color: textColor,
    fontSize: scaleInApp(30)
  },
  xxxExtraText: {
    ...FontStyle.normal,
    color: textColor,
    fontSize: scaleInApp(60),
    lineHeight: scaleInApp(60)
  },
  extraText: {
    ...FontStyle.normal,
    color: textColor,
    fontSize: scaleInApp(22)
  },
  bigText: {
    ...FontStyle.normal,
    fontSize: scaleInApp(18)
    // fontSize: 18 * scale()
  },
  mediumText: {
    ...FontStyle.normal,
    color: textColor,
    fontSize: scaleInApp(16)
    // lineHeight: scaleInApp(14)
  },
  normalText: {
    ...FontStyle.normal,
    color: textColor,
    fontSize: scaleInApp(14)
  },
  smallText: {
    ...FontStyle.normal,
    color: textColor,    
    fontSize: scaleInApp(12)
  },
  minimizeText: {
    ...FontStyle.normal,
    color: textColor,
    fontSize: scaleInApp(10)
  }
});
export default TextStyle;
