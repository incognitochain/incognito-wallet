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
    marginBottom: 40,
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
    backgroundColor: COLORS.blue6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    margin: 10,
    marginTop: 10,
    backgroundColor: COLORS.lightGrey5,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 10,
    margin: 10,
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
    fontSize: FONT.SIZE.veryLarge,
    color: COLORS.black,
    textAlign: 'center',
    height: '100%',
  },
  symbolStyle: {
    marginTop: 14,
  },
  rightButton: {
    width: 22,
    height: 22,
  },
  loading: {
    height: '10%',
    justifyContent: 'center'
  }
});

export default style;
