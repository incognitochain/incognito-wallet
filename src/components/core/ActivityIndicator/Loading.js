import React from 'react';
import {View, StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';
import { COLORS } from '@src/styles';
import { ScreenWidth } from '@src/utils/devices';


const Loading = () => {
  return (
    <View style={styles.content}>
      <View animation="fadeIn" style={styles.container}>
        <LottieView
          autoPlay
          loop
          source={require('../../../assets/lottie/loading.json')}
        />
      </View>
    </View>
  );
};

export default Loading;

const styles = StyleSheet.create({ 
  content: {
    width: '100%', 
    height: '100%', 
    position: 'absolute',
    alignContent: 'center', 
    alignItems: 'center', 
    alignSelf: 'center', 
    justifyContent: 'center' 
  },
  container: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, 
    backgroundColor: COLORS.white, 
    borderColor: COLORS.lightGrey13, 
    borderWidth: 0.5, 
    borderRadius: ScreenWidth / 10, 
    width: ScreenWidth / 5, 
    height: ScreenWidth / 5, 
    alignContent: 'center', 
    alignItems: 'center', 
    alignSelf: 'center', 
    justifyContent: 'center'
  }
});