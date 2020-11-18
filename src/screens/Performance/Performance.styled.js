import { StyleSheet } from 'react-native';
import { UTILS } from '@src/styles';

export const styled = StyleSheet.create({
  wrapper: {
    zIndex: 1000,
    width: UTILS.screenWidth() - 50,
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    height: '30%',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 7
  },
  wrapContent: {
    flex: 1,
  },
  text: {
    color: '#00F900',
  },
  btn: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight: 5,
    marginTop: 5
  },
  btnClear: {
    width: 65,
    height: 30,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 7,
    backgroundColor: '#8A8A8E'
  },
  abs: {
    position: 'absolute',
    bottom: 25,
    right: 25,
  },
});
