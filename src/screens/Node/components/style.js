import { StyleSheet } from 'react-native';
import { COLORS, FONT } from '@src/styles';

const style = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    marginBottom: 15,
  },
  containerDetail: {
    backgroundColor: COLORS.white,
    marginBottom: 15,
    padding: 20,
    paddingTop: 0
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  itemLeft: {
    marginRight: 'auto',
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.medium,
    color: COLORS.colorPrimary,
    textAlign: 'left',
  },
  itemRight: {
    marginLeft: 'auto',
    paddingVertical: 5
  },
  statusContainer: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginEnd: 20,
  },  
  dot: {
    width: 6,
    height: 6,
    marginTop: 20,
    borderRadius: 3,
    backgroundColor: COLORS.lightGrey5,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 20,
    backgroundColor: COLORS.blue6,
  },
  balance: {
    fontFamily: FONT.NAME.specialRegular,
    fontSize: 20,
    color: COLORS.colorGreyBold,
  },
  balanceContainer: {
    justifyContent: 'center', 
    alignItems: 'center', 
    alignContent: 'center' 
  },
  balanceUpdate: {
    color: 'black', 
    alignSelf: 'center', 
    textAlign: 'center', 
    fontSize: FONT.FONT_SIZES.avgLarge, 
    fontFamily: FONT.NAME.semiBold
  },
  itemCenter: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  imageWrapper: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  token: {
    fontFamily: FONT.NAME.specialRegular,
    fontSize: 20,
    color: COLORS.colorGreyBold,
    textAlign: 'center'
  },
  desc: {
    marginTop: 15,
  },
  greyText: {
    color: COLORS.lightGrey1,
  },
  greenText: {
    color: COLORS.green,
  },
  withdrawMenuItem: {
    flexDirection: 'row',
    opacity: 0.4,
  },
  withdrawText: {
    marginRight: 15,
  },
  stakeButton: {
    height: 30,
    minWidth: 80,
  },
  loading: {
    marginLeft: 10,
  },
  hidden: {
    opacity: 1,
  },
  fixButton: {
    backgroundColor: COLORS.dark3,
  },
  centerAlign: {
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
    width: 20,
    height: 16,
    resizeMode: 'contain',
  },
  disabled: {
    opacity: 0.6,
  },
  balanceList: {
    width: '100%', 
    marginTop: 30, 
    height: 70
  }
});

export const rewardStyle = StyleSheet.create({
  slider: {
    height: 50,
    marginTop: 10,
    width: 220,
  },
  container: {
    justifyContent: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    width: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLeft: {
    marginRight: 'auto',
  },
  itemRight: {
    marginLeft: 'auto',
  },
  itemCenter: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  dot: {
    width: 16,
    height: 2,
    borderRadius: 0,
    backgroundColor: COLORS.lightGrey5,
  },
  activeDot: {
    width: 16,
    height: 2,
    borderRadius: 0,
    backgroundColor: COLORS.primary,
  },
  balance: {
    fontFamily: FONT.NAME.specialRegular,
    fontSize: 20,
    color: COLORS.colorGreyBold,
    textAlign: 'center'
  }
});

export default style;
