import { COLORS, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    minHeight: 500,
  },
  headerRight: {
    paddingHorizontal: 10
  },
  chooseTokenIcon: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export const requestSendTxStyle = {
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  title: {
    marginVertical: 30,
    fontSize: 25,
  },
  infoContainer: {
    marginTop: 15,
    paddingBottom: 5,
    width: '100%',
    flexDirection: 'column',
    marginVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey4
  },
  infoLabel: {
    ...FONT.STYLE.medium,
  },
  infoValue: {},
  groupBtn: {
    marginTop: 50,
    flexDirection: 'row'
  },
  cancelBtn: {
    marginHorizontal: 10,
    minWidth: 100,
    maxWidth: 150,
    backgroundColor: COLORS.lightGrey3
  },
  submitBtn: {
    marginHorizontal: 10,
    width: 150,
  },
  receiverContainer: {
    marginVertical: 2
  },
  receiverAddress: {
    fontSize: 14
  },
  receiverAmount: {
    fontSize: 14
  }
};

export default style;
