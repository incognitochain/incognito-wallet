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
    paddingTop: 15,
    paddingHorizontal: 5,
    minHeight: '100%',
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
    // backgroundColor: COLORS.dark2,
  },
  buyButton: {
    marginTop: 15,
    marginHorizontal: 15,
    marginBottom: 100,
    // paddingBottom: 20
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
    paddingHorizontal: 15,
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
});

export default style;
