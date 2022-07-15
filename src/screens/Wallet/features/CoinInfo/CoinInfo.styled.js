import { StyleSheet } from 'react-native';
import { FONT, COLORS } from '@src/styles';

export const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 25,
    alignItems: 'center',
  },
  label: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 4,
    width: 130,
    marginRight: 15,
  },
  labelIsVerified: {
    minWidth: null,
    flex: null,
    marginRight: 5,
  },
  value: {
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 4,
    flex: 5,
    textAlign: 'left',
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
    flex: 1,
  },
  btnInfo: {
    flex: 1,
  },
});
