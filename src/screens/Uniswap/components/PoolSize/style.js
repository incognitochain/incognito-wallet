import { StyleSheet } from 'react-native';
import { COLORS } from '@src/styles';

export default StyleSheet.create({
  twoColumns: {
    flexDirection: 'row',
    marginTop: 10,
  },
  feeTitle: {
    width: 70,
    fontSize: 13,
    color: COLORS.lightGrey1,
  },
  fee: {
    fontSize: 13,
    textAlign: 'right',
    marginBottom: 4,
  },
  textRight: {
    textAlign: 'right',
    marginLeft: 'auto',
  },
  flex: {
    flex: 1,
  },
});
