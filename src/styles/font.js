import { Platform, PixelRatio, Dimensions } from 'react-native';
import { isIOS } from '@src/utils/platform';

const FONT_FAMILY = Platform.OS === 'ios' ? 'SFProDisplay' : 'SF-Pro-Display-';
const FONT_FAMILY_SPECIAL =
  Platform.OS === 'ios' ? 'HelveticaNeue' : 'Helvetica-Neue';

const fontNames = {
  default:
    Platform.OS === 'ios' ? `${FONT_FAMILY}-Light` : `${FONT_FAMILY}Light`,
  italic:
    Platform.OS === 'ios'
      ? `${FONT_FAMILY}-LightItalic`
      : `${FONT_FAMILY}LightItalic`,
  medium:
    Platform.OS === 'ios' ? `${FONT_FAMILY}-Medium` : `${FONT_FAMILY}Medium`,
  mediumItalic:
    Platform.OS === 'ios'
      ? `${FONT_FAMILY}-MediumItalic`
      : `${FONT_FAMILY}MediumItalic`,
  bold: Platform.OS === 'ios' ? `${FONT_FAMILY}-Bold` : `${FONT_FAMILY}Bold`,
  boldItalic:
    Platform.OS === 'ios'
      ? `${FONT_FAMILY}-BoldItalic`
      : `${FONT_FAMILY}BoldItalic`,
  regular:
    Platform.OS === 'ios' ? `${FONT_FAMILY}-Regular` : `${FONT_FAMILY}Regular`,
  regularItalic:
    Platform.OS === 'ios'
      ? `${FONT_FAMILY}-RegularItalic`
      : `${FONT_FAMILY}RegularItalic`,
  specialRegular:
    Platform.OS === 'ios' ? `${FONT_FAMILY_SPECIAL}` : `${FONT_FAMILY_SPECIAL}`,
  specialBold: `${FONT_FAMILY_SPECIAL}-Bold`,
  specialMedium: `${FONT_FAMILY_SPECIAL}-Medium`,
};

const fontStyle = {
  normal: {
    fontFamily: fontNames.regular,
  },
  medium: {
    fontFamily: fontNames.medium,
  },
  bold: {
    fontFamily: fontNames.bold,
  },
  light: {
    fontFamily: fontNames.light,
  },
};

const getFontScale = PixelRatio.getFontScale();

const fontSizes = {
  superSmall: 12,
  small: 14,
  regular: 16,
  medium: 18,
  superMedium: 20,
  large: 22,
  veryLarge: 38,
  superLarge: 40,
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// based on iphone 5s's scale
const scale = SCREEN_WIDTH / 320;

export function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
}

const getFontSizes = () =>
  Object.keys(fontSizes).reduce((acc, key) => {
    const ratio = PixelRatio.get();
    const size = isIOS() ? fontSizes[key] - 4 : fontSizes[key] - 2;
    acc[key] = normalize(size * getFontScale);
    return acc;
  }, {});

export default {
  NAME: fontNames,
  SIZE: getFontSizes(),
  STYLE: fontStyle,
  NORMALIZE: normalize,
  FONT_SIZES: fontSizes,
};
