import {StyleSheet} from 'react-native';
import {FONT, UTILS, COLORS} from '@src/styles';

export const styledModal = StyleSheet.create({
  container: {
    backgroundColor: COLORS.lightGrey6,
    flex: 1,
    padding: 20,
    position: 'relative',
    zIndex: 100,
    // minHeight: UTILS.deviceHeight() - 200,
  },
});

export const emptyListStyled = StyleSheet.create({
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
    color: COLORS.lightGrey1,
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 6,
    marginTop: 10,
  },
  notFoundImg: {
    width: 194,
    height: '50%',
  },
});

export const listStyled = StyleSheet.create({
  container: {
    borderRadius: 8,
    backgroundColor: COLORS.white,
    marginTop: 20,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 20,
  },
  all: {
    color: COLORS.black,
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.regular + 2,
    lineHeight: FONT.SIZE.regular + 6,
    marginTop: '5%',
    paddingHorizontal: 20,
  },
});
export const itemStyled = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey6,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  hook: {
    flex: 1,
    paddingLeft: 20,
  },
  name: {
    color: COLORS.black,
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 6,
  },
  address: {
    color: COLORS.lightGrey1,
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 6,
    marginTop: 2,
  },
});
