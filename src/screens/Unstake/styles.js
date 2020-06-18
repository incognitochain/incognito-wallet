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
    padding: 35,
    backgroundColor: COLORS.white,
    shadowOpacity: 1,
    shadowRadius: 4,
    shadowColor: '#DCDDDD',
    shadowOffset: { height: 2, width: 0 },
  },
  title: {
    fontSize: 18,
    marginBottom: 15,
    ...FONT.STYLE.medium,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 7,
  },
  itemRight: {
    marginLeft: 'auto',
  },
  field: {
    color: COLORS.lightGrey1,
  },
  button: {
    backgroundColor: COLORS.red,
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
  error: {
    marginTop: 10,
    color: COLORS.red,
    fontSize: 14,
  },
});
