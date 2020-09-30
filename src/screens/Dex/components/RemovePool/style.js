import { StyleSheet } from 'react-native';
import {COLORS} from '@src/styles';

export default StyleSheet.create({
  headerTitle: {
    color: COLORS.lightGrey1,
    fontSize: 15,
    marginBottom: 20,
  },
  output: {
    fontSize: 22,
  },
  symbol: {
    fontSize: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginLeft: 2,
  }
});
