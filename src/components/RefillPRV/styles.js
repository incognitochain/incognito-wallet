import { StyleSheet } from 'react-native';
import { FONT, COLORS, UTILS } from '@src/styles';

const styles = StyleSheet.create({
  dialog: {
    margin: 25,
    position: 'relative',
    borderRadius: 13,
    width: UTILS.deviceWidth() - 50,
  },
  hook: {
    marginVertical: 50,
    padding: 20,
    borderRadius: 13,
  },
  title: {
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 5,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 15,
  },
  desc: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 5,
    color: COLORS.colorGreyBold,
    textAlign: 'center',
  },

  buttonArea: {
    marginTop: 30,
    width: '100%',
    flexDirection: 'row',
  },

  wrapperCancelBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    color: COLORS.blue5,
  },

  wrapperConfirmBtn: {
    flex: 1,
  },

  spaceView: {
    width: 20,
  },
});

export default styles;
