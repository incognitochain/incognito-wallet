import { StyleSheet } from 'react-native';
import { FONT, COLORS } from '@src/styles';

export const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingLeft: 25,
  },
  category: {
    marginTop: 30,
  },
  title: {
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 4,
    color: COLORS.black,
    paddingLeft: 25,
  },
  subTitle: {
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 5,
    color: COLORS.black,
  },
});

export const listNewsStyled = StyleSheet.create({

  highlights: {
    backgroundColor: '#D9F4FF',
    padding: 15
  },

  hook: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  hook1: {
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  hook2: {
    marginTop: 30,
  },
  hook3: {
    marginTop: 15,
  },
  icon: {
    width: 55,
    height: 55,
    marginRight: 20,
  },
  desc: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 5,
    color: COLORS.colorGreyBold,
    flex: 1,
  },
  descNoIcon: {
    flex: 0,
    marginRight: 2,
  },
  circle: {
    backgroundColor: COLORS.black,
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  extra: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: 20,
  },
  listNews: {},
});
