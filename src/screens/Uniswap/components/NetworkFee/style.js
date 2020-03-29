import { StyleSheet } from 'react-native';
import { COLORS } from '@src/styles';

export default StyleSheet.create({
  twoColumns: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  feeTitle: {
    fontSize: 13,
    color: COLORS.lightGrey1,
  },
  fee: {
    fontSize: 13,
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
    marginLeft: 'auto',
  },
  ellipsis: {
    flex: 1,
  },
});
