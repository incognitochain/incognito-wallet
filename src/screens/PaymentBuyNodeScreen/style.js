import { StyleSheet} from 'react-native';
import { COLORS } from '@src/styles';

const style = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 30,
    height: '100%',
    paddingTop: 0
  },
  content: {
    backgroundColor: COLORS.white,
    maxHeight: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modes: {
    flexDirection: 'row',
  },
  mode: {
    width: '50%',
    paddingVertical: 15,
    paddingLeft: 20 ,
    paddingEnd: 20,
  },
  modeText: {
    textAlign: 'center',
  },
  deactiveMode: {
    backgroundColor: COLORS.lightGrey7,
    borderColor: COLORS.lightGrey5,
    borderWidth: 1,
  },
  deactiveModeText: {
    color: COLORS.lightGrey1,
  },
});

export default style;
