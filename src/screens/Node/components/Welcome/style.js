import { StyleSheet } from 'react-native';
import { COLORS, FONT } from '@src/styles';
import { ScreenWidth } from '@src/utils/devices';
import theme from '@src/styles/theme';

const style = StyleSheet.create({
  container: {
    padding: 30,
    paddingTop: 0,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 24,
    ...FONT.STYLE.medium,
    textAlign: 'center'
  },
  headerContainer: {
    flexDirection: 'row', 
    alignContent: 'center', 
    alignItems: 'center', 
    justifyContent: 'flex-start' 
  },
  pNode: {
    paddingTop: 30,
    backgroundColor: COLORS.white,
    marginBottom: 15,
  },
  pNodeImg: {
    alignSelf: 'center',
    width: ScreenWidth,
    height: ScreenWidth * 0.82,
  },
  pNodeButton: {
    marginBottom: 55,
    height: theme.SIZES.button.height
  },
  buyButton: {
    backgroundColor: COLORS.white,
  },
  buyText: {
    textAlign: 'left',
    color: COLORS.colorPrimary,
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.medium,
    marginBottom: 15,
  },
  getNode: {
    textAlign: 'left',
    color: COLORS.lightGrey1,
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
  },
  vNodeTitle: {
    textAlign: 'center',
    color: COLORS.lightGrey9,
    marginTop: 35,
    marginBottom: 15,
  },
  vNodeText: {
    color: COLORS.dark1,
  },
  vNodeButton: {
    shadowOpacity: 1,
    shadowRadius: 4,
    shadowColor: COLORS.lightGrey15,
    shadowOffset: { height: 2, width: 0 },
    marginBottom: 50,
    borderWidth: 1,
    elevation: 3,
    backgroundColor: COLORS.white,
  }
});

export default style;
