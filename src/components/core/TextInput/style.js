import { COLORS, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

const style = StyleSheet.create({
  container: {
    marginTop: 30,
  },
  row: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'center',
    height: 30,
  },
  label: {
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium,
    color: COLORS.black,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.superMedium,
    color: COLORS.colorGreyBold,
    height: '100%',
    padding: 0,
    marginRight: 10,
  },
});

export default style;
