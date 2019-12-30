import { StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT } from '@src/styles';

export default StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    flexDirection: 'column',
    alignItems: 'center'
  },
  row: {
    flexDirection: 'row',
    flex: 3,
  },
  rowText: {
    display: 'flex',
    flexDirection: 'row',
    marginVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey6,
    paddingBottom: 2,
    marginHorizontal: 10,
  },
  icon: {
    fontSize: 100,
    color: COLORS.primary,
    marginVertical: 40
  },
  labelText: {
    flex: 1,
    marginRight: 15,
    color: COLORS.lightGrey1,
    fontSize: 15,
    marginVertical: 2,
  },
  valueText: {
    flex: 3,
    color: COLORS.black,
    fontSize: 15,
    marginVertical: 2,
  },
  multipleAddress: {
    flex: 3,
    marginVertical: 2,
  },
  txButton: {
    flex: 3,
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRadius: 3
  },
  statusValueContainer: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    textAlign: 'left',
    flex: 1
  },
  statusRetryBtn: {
    height: 25,
    marginLeft: 20
  },
  depositAddressContainer: {
    marginTop: 20,
    alignItems: 'center'
  },
  copyBlock: {
    marginLeft: 5
  }
});
