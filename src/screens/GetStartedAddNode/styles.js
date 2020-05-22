import { StyleSheet } from 'react-native';
import TextStyle, { scaleInApp, FontStyle } from '@src/styles/TextStyle';
import {COLORS} from '@src/styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding:scaleInApp(20),
    flexDirection: 'column',
  },
  item: {
    marginVertical: scaleInApp(10)
  },
  errorText:{
    ...TextStyle.minimizeText,
    textAlign:'center',
    color:'#FF9494',
  },
  title1:{
    ...TextStyle.minimizeText,
    ...FontStyle.medium,
    color:'#101111',
    marginVertical:scaleInApp(10),
    textAlign:'center',
  },
  title2:{
    marginVertical:scaleInApp(10),
    marginTop: 25,
    ...TextStyle.bigText,
    ...FontStyle.medium,
    width:'75%',
    alignSelf:'center',
    color:'#101111',
    textAlign:'center',
  },
  content:{
    margin:scaleInApp(20),
    flex:1,
    justifyContent:'center',
    flexDirection:'column'
  },
  content_step1_image:{
    alignSelf:'center',
    resizeMode: 'contain',
  },
  content_step2_image:{
    alignSelf:'center',
    resizeMode: 'contain',
    width: '100%',
    height: 70,
  },
  content_step3_image:{
    alignSelf:'center',
    resizeMode: 'contain',
    marginTop: 20,
  },
  content_step1:{
    alignSelf:'center'
  },
  footer:{
    marginVertical: scaleInApp(20),
    flexDirection: 'column',
  },
  button:{
    backgroundColor:'#25CDD6',
    marginHorizontal:scaleInApp(20),
    padding:scaleInApp(10),
    borderRadius:scaleInApp(4),
  },
  textTitleButton:{
    ...TextStyle.mediumText,
    ...FontStyle.medium,
    color:'#FFFFFF'
  },
  step3_text:{
    ...TextStyle.normalText,
    color:'#101111',
    alignSelf:'center'
  },
  item_container_input:{
    borderBottomColor: '#E5E9EA',
    borderBottomWidth: scaleInApp(1)
  },
  text: {
    ...TextStyle.normalText,
    color:'#1C1C1C',
  },
  item_container_error:{
    borderBottomColor: '#E5E9EA',
    borderBottomWidth: scaleInApp(1),
    paddingVertical:scaleInApp(10),
  },
  linkBtn: {
    marginVertical: 15,
    color: COLORS.primary,
    alignSelf: 'center',
  },
  centerText: {
    textAlign: 'center',
    marginVertical: 20,
  },
  divider: {
    width: '100%',
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey5,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
  },
  guideLine: {
    marginTop: 15,
    fontSize: 14,
  },
  bold: {
    ...FontStyle.bold,
    fontSize: 14,
  },
  icon: {
    marginHorizontal: 5,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  guide: {
    marginBottom: 25,
  },
  log: {
    paddingTop: 20,
    flexDirection: 'row',
  },
  logIcon: {
    marginRight: 15,
    width: 20,
    height: 20,
    paddingTop: 3,
  },
  disabledText: {
    color: COLORS.lightGrey1,
  },
  headerRight: {
    marginRight: 15,
  }
});

export default styles;
