import { StyleSheet } from 'react-native';
import { FONT, COLORS } from '@src/styles';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContainer: {
    flex: 1,
  },
  iconContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 60,
  },
  text: {
    maxWidth: 400,
    textAlign: 'center',
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.regular,
    color: COLORS.black,
  },
  subText: {
    marginTop: 5,
    maxWidth: 500,
    textAlign: 'center',
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.regular,
    color: COLORS.black,
  },
  buttonContainer: {
    marginVertical: 50,
  },
});
