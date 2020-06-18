import { StyleSheet } from 'react-native';
import { FONT, COLORS, UTILS } from '@src/styles';

export const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  label: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 4,
    color: COLORS.colorGreyBold,
    flex: 1,
    marginRight: 15,
    minWidth: (75 / 375) * UTILS.deviceWidth(),
  },
  labelIsVerified: {
    minWidth: null,
    flex: null,
    marginRight: 5,
  },
  value: {
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 4,
    color: COLORS.black,
    flex: 5,
    paddingRight: 10,
  },
  verified: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 4,
    color: COLORS.green,
  },
  token: {
    marginBottom: 50,
  },
  wrapper: {
    marginTop: 27,
  },
  btnInfo: {
    flex: 1,
  },
});
