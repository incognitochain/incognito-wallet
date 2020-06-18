import { StyleSheet } from 'react-native';
import { COLORS, FONT } from '@src/styles';
import TextStyle, {FontStyle, scaleInApp} from '@src/styles/TextStyle';

const style = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  rightItem: {
    marginLeft: 'auto',
  },
  container: {
    padding: 20,
    paddingTop: 0,
    minHeight: '100%',
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row', 
    alignContent: 'center', 
    alignItems: 'center', 
    justifyContent: 'flex-start' 
  },
  background: {
    position: 'absolute',
    height: 120,
    left: 0,
    right: 0,
  },
  buyButton: {
    marginTop: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: COLORS.white,
    ...FONT.STYLE.medium,
  },
  addNodeButton: {
    backgroundColor: COLORS.transparent,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  addNodeButtonDisabled: {
    backgroundColor: COLORS.transparent,
    borderWidth: 1,
    opacity: 0.5,
    borderColor: COLORS.primary,
  },
  addNodeText: {
    color: COLORS.primary,
  },
  header: {
    marginBottom: 30,
    marginHorizontal: 15,
  },
  list: {
    paddingBottom: 50,
    flex: 1
  },
  container_first_app:{
    flex: 1,
    flexDirection:'row',
    justifyContent:'center',
    backgroundColor: 'transparent'
  },
  group_first_open:{
    width:'100%',
    paddingHorizontal: 25,
    alignSelf:'flex-end',
    backgroundColor: COLORS.white,
  },
  group_first_open_text01:{
    textAlign:'center',
    ...TextStyle.bigText,
    color: '#101111',
  },
  group_first_open_text02:{
    ...TextStyle.normalText,
    marginBottom:scaleInApp(20),
    textAlign:'center',
    color: '#8C9A9D',
  },
  textTitleButton:{
    ...TextStyle.mediumText,
    ...FontStyle.medium,
    color:'#FFFFFF'
  },
  button:{
    backgroundColor:'#25CDD6',
    padding:scaleInApp(10),
    borderRadius:scaleInApp(4),
    marginTop:scaleInApp(10),
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
});

export default style;
