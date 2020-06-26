import { StyleSheet } from 'react-native';
import TextStyle, { FontStyle, scaleInApp } from '@src/styles/TextStyle';
import { COLORS } from '@src/styles';

const styles = StyleSheet.create({
  container: {
  },
  textItem: {
    ...TextStyle.normalText,
    color: 'black'
  },
  textSubtitle: {
    ...TextStyle.minimizeText,
    color: '#91A4A6'
  },
  dialog_title_text: {
    ...TextStyle.bigText,
    ...FontStyle.bold,
    alignSelf: 'center',
    color: COLORS.colorPrimary,
  },
  dialog_content_text: {
    ...TextStyle.normalText,
    color: COLORS.colorGreyBold,
    textAlignVertical: 'center',
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  dialog_content: {
    flex: 1,
    marginTop: 20,
  },
  dialog_container: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 40,
  },
  dialog_button: {
    backgroundColor: '#25CDD6',
    borderRadius: scaleInApp(4),
  },
  textTitleButton: {
    ...TextStyle.mediumText,
    ...FontStyle.medium,
    color: '#FFFFFF'
  },
  close: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default styles;
