import { COLORS, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

const bottomBarHeight = 50;

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: bottomBarHeight,
    marginBottom: 10,
  },
  wrapper: {
    flex: 1,
    marginTop: 40,
  },
  arrowWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    height: 40,
    resizeMode: 'contain',
  },
  divider: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.lightGrey18,
  },
  button: {
    marginVertical: 50,
    backgroundColor: COLORS.blue5,
    height: 50,
  },
  buttonTitle: {
    fontSize: 20,
    ...FONT.STYLE.medium,
  },
  error: {
    color: COLORS.red,
    fontSize: 14,
    marginTop: -10,
  },
  warning: {
    color: COLORS.orange,
  },
  bottomFloatBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomText: {
    color: COLORS.lightGrey16,
    ...FONT.STYLE.medium,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'white',
    height: bottomBarHeight,
    justifyContent: 'center',
    alignItems: 'flex-end',
    left: 0,
    right: 0,
  },
});
