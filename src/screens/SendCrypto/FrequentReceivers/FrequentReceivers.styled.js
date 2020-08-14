import { StyleSheet } from 'react-native';
import { FONT, COLORS } from '@src/styles';

export const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    marginTop: 20,
  },
  label: {
    textTransform: 'none',
  },
  tip: {
    textAlign: 'center',
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 6,
    color: COLORS.lightGrey1,
    marginVertical: 40,
    paddingHorizontal: 40,
  },
});

export const styledModal = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 25,
  },
});

export const notFoundStyled = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
  },
  hook: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    color: COLORS.colorGreyBold,
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 4,
    marginTop: 20,
  },
  notFoundImg: {
    width: 194,
    height: 164,
  },
  btnUseAddr: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
});

export const listStyled = StyleSheet.create({
  container: {
    flex: 1,
  },
  all: {
    color: COLORS.black,
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 6,
    marginLeft: 15,
  },
});
export const itemStyled = StyleSheet.create({
  hook: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  name: {
    color: COLORS.black,
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 4,
    marginBottom: 10,
  },
  address: {
    color: COLORS.colorGreyBold,
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 4,
  },
  lastChild: {
    borderBottomColor: 'transparent',
  },
});
