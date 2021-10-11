import {StyleSheet} from 'react-native';
import {COLORS, FONT} from '@src/styles';

const styled = StyleSheet.create({
  hookContainer: {
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  hookLabel: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 7,
    color: COLORS.lightGrey34,
  },
  hookValue: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 7,
    color: COLORS.black,
  },
});

export default styled;
