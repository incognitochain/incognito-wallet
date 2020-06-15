import TextStyle, { FontStyle, scaleInApp } from '@src/styles/TextStyle';
import { StyleSheet } from 'react-native';
import { COLORS, FONT } from '@src/styles';

export const placeHolderColor = '#B9C9CA';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: scaleInApp(20),
    paddingTop: 0,
  },
  item: {
    marginTop: scaleInApp(30)
  },
  item_container_input:{
    borderColor: '#E5E9EA',
    borderBottomWidth: scaleInApp(1),
    // paddingVertical: scaleInApp(10)
  },
  group_list_account:{
    flexDirection:'column'
  },
  item_account_text: {
    ...TextStyle.normalText,
    color: COLORS.colorPrimary,
    paddingVertical: scaleInApp(5)
  },
  textInputPrivateKey:{
    flex:1,
    marginTop: scaleInApp(20),
    borderColor:'#E5E9EA',
    textAlignVertical:'top',
    paddingTop: scaleInApp(15),
    paddingBottom: scaleInApp(15),
    paddingHorizontal:scaleInApp(20),
    borderBottomWidth: scaleInApp(1),
    borderRadius:scaleInApp(4)
  },
  textInput: {
    ...TextStyle.mediumText,
    color: COLORS.colorPrimary,
    fontFamily: FontStyle.light.fontFamily,
    fontSize: FONT.FONT_SIZES.regular
  },
  buttonChooseAccount:{
    ...TextStyle.smallText,
    color:'#25CDD6',
    textAlign:'right',
    marginTop:scaleInApp(10),
    backgroundColor:'transparent'
  },
  errorText: {
    ...TextStyle.smallText,
    color: 'red',
    marginTop: scaleInApp(8)
  },
  label: {
    ...TextStyle.mediumText,
    color: COLORS.colorPrimary,
    fontFamily: FontStyle.medium.fontFamily,
    marginBottom: -20
  },
  button:{
    backgroundColor:'#25CDD6',
    padding:scaleInApp(10),
    borderRadius:scaleInApp(4),
    marginTop:scaleInApp(30),
  },
  textTitleButton:{
    ...TextStyle.mediumText,
    ...FontStyle.medium,
    color:'#FFFFFF'
  },
  
  group_host: {
    backgroundColor: '#FFFFFF',
  },
  dialog_content:{
    paddingVertical:scaleInApp(5),
  }
});

export default styles;
