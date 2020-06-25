import { COLORS, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';
import { ScreenWidth } from '@src/utils/devices';

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    width: ScreenWidth,
    marginLeft: -25, // Cheat sheet
    minHeight: 500,
    paddingBottom: 50
  },
  headerRight: {
    paddingHorizontal: 10,
  },
  loading: {
    position: 'absolute',
    left: '50%',
    right: '50%',
    top: '50%',
    bottom: '50%',
  },
  chooseTokenIcon: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigation: {
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    height: 50, 
    width: ScreenWidth, 
    flexDirection: 'row', 
    paddingLeft: 10, 
    marginLeft: -25,
    backgroundColor: 'white'
  },
  back: {
    height: 70, 
    width: 50, 
    justifyContent: 'center', 
    alignContent: 'center', 
    alignItems: 'center', 
    marginEnd: 5
  },
  rightContainer: {
    flexDirection: 'row', 
    flex: 1, 
    justifyContent: 'flex-end'
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
    borderBottomColor: COLORS.lightGrey4,
  },
  infoLabel: {
    ...FONT.STYLE.medium,
  },
  infoValue: {},
  groupBtn: {
    marginTop: 50,
    flexDirection: 'row',
  },
  cancelBtn: {
    marginHorizontal: 10,
    width: 150,
    backgroundColor: COLORS.lightGrey3,
  },
  submitBtn: {
    marginHorizontal: 10,
    width: 150,
  },
};

export const containerStyle = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchIcon: {
    width: 60,
    height: 60,
  },
  desc: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 5,
    color: COLORS.colorGreyBold,
    textAlign: 'center',
    marginTop: 20
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default style;
