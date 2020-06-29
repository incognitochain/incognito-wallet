import { StyleSheet } from 'react-native';
import {COLORS, FONT} from '@src/styles';

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    padding: 20,
    paddingTop: 0,
    backgroundColor: COLORS.lightGrey14,
  },
  card: {
    padding: 10,
    paddingEnd: 10,
    paddingLeft: 10,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    ...FONT.STYLE.bold,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 7,
  },
  itemRight: {
    marginLeft: 'auto',
    ...FONT.STYLE.bold,
  },
  field: {
    color: COLORS.lightGrey1,
  },
  button: {
    marginTop: 40,
  },
  buy: {
    marginTop: 20,
  },
  desc: {
    color: COLORS.lightGrey9,
  },
  firstLine: {
    marginBottom: 20,
  },
});
