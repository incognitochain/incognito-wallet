import { COLORS } from '@src/styles';
import { StyleSheet } from 'react-native';

const style = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  backBtn: {
    bottom: 10,
    right: 10,
    width: 50,
    height: 50,
    position: 'absolute',
    backgroundColor: COLORS.lightGrey5,
    opacity: 0.5,
    borderRadius: 50,
    padding: 15,
  },
  loading: {
    position: 'absolute',
    left: '50%',
    right: '50%',
    top: '50%',
    bottom: '50%',
  },
  customBackContainer: {
    position: 'absolute',
    top: 6,
    left: 10,
    zIndex: 1,
    width: 25,
    height: 25,
  },
  navigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 60,
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  back: {
    width: '25%',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
  },
});

export default style;
