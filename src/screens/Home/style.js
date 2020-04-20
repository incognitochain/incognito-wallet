import {StyleSheet, Dimensions} from 'react-native';
import {COLORS} from '@src/styles';

const {width} = Dimensions.get('window');
const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
  },
  btnContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    alignContent: 'center',
    width: width,
    height: '100%',
    marginTop: 10,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.lightGrey6,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  btn: {
    width: '33%',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignContent: 'center',
    height: 70,
    alignItems: 'center',
    paddingEnd: 35,
    paddingLeft: 35,
    justifyContent: 'space-between',
  },
  accTitle: {
    color: COLORS.black
  }
});

export default style;
