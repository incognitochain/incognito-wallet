import TextStyle, { FontStyle, scaleInApp } from '@src/styles/TextStyle';
import { StyleSheet } from 'react-native';
import { FONT, COLORS } from '@src/styles';

export const rightNextIcon = {
  size: scaleInApp(25), type: 'material',
  name: 'navigate-next', color: '#C3C8C9',
  containerStyle: {
    alignSelf: 'flex-start'
  }, iconStyle: {

  }
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 0,
    flexDirection: 'row',
  },
  content: {
    marginTop: 30,
  },
  contentItem: {
    marginBottom: 30,
  },
  container_list_action: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'transparent'
  },
  title: {
    ...FontStyle.medium,
    fontSize: scaleInApp(16),
    fontFamily: FONT.NAME.bold,
    color: COLORS.colorPrimary
  },
  subTitle: {
    ...TextStyle.normalText,
    marginTop: scaleInApp(5),
    fontFamily: FontStyle.medium.fontFamily,
    lineHeight: scaleInApp(20),
    color: '#9FA4A5'
  },
  item_container: {
    paddingVertical: scaleInApp(10),
    backgroundColor: 'transparent',
  },
  avatar: {
    height: scaleInApp(30),
    width: scaleInApp(30),
    alignSelf: 'flex-start',
    marginRight: scaleInApp(10)
  }
});

export default styles;
