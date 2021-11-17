import { COLORS } from '@src/styles';
import { StyleSheet } from 'react-native';

export const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    paddingTop: 32,
  },
  styledTabs: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: COLORS.colorGrey2,
    borderBottomWidth: 1,
  },
  btnOrderHistory: {
    marginRight: 15,
  },
  rightHeader: {
  },
  styledTabList: {
    borderBottomWidth: 0,
  },
});
