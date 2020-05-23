import {StyleSheet} from 'react-native';
import TextStyle, {FontStyle, scaleInApp} from '@src/styles/TextStyle';

const styles = StyleSheet.create({
  container: {
  },
  textItem:{
    ...TextStyle.normalText,
    color:'black'
  },
  textSubtitle:{
    ...TextStyle.minimizeText,
    color:'#91A4A6'
  },
  dialog_title_text: {
    ...TextStyle.bigText,
    ...FontStyle.medium,
    alignSelf:'center',
    color:'#1C1C1C',
  },
  dialog_content_text: {
    ...TextStyle.normalText,
    color:'#1C1C1C',
    textAlignVertical:'center',
    textAlign:'center',
    paddingHorizontal: 5,
  },
  dialog_content: {
    flex:1,
    alignItems:'center',
    justifyContent:'center',
  },
  dialog_container:{
    flex:1,
    paddingVertical:scaleInApp(20),
    paddingHorizontal:scaleInApp(30),
  },
  dialog_button:{
    backgroundColor:'#25CDD6',
    borderRadius:scaleInApp(4),
  },
  textTitleButton:{
    ...TextStyle.mediumText,
    ...FontStyle.medium,
    color:'#FFFFFF'
  },
});

export default styles;
