import { StyleSheet } from 'react-native';
import { UTILS } from '@src/styles';

export const styled = StyleSheet.create({
  scrollview: {
    zIndex: 1000,
    width: UTILS.screenWidth() - 50,
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  text: {
    color: '#FFF',
  },
  btn: {
    alignItems: 'flex-end',
  },
  abs: {
    position: 'absolute',
    bottom: 25,
    right: 25,
  },
});
