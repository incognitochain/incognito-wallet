import React, {memo} from 'react';
import historySrc from '@src/assets/images/new-icons/history_order.png';
import {Image, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from 'react-navigation-hooks';
import routeNames from '@routers/routeNames';

const styled = StyleSheet.create({
  container: {
    paddingLeft: 20,
    paddingRight: 15,
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    top: -5,
    bottom: -5,
  },
  image: {
    width: 22,
    height: 22
  }
});

const LPHistoryIcon = () => {
  const navigation = useNavigation();
  const onPress = () => navigation.navigate(routeNames.LiquidityHistories);
  return (
    <TouchableOpacity style={styled.container} onPress={onPress}>
      <Image style={styled.image} source={historySrc} />
    </TouchableOpacity>
  );
};

LPHistoryIcon.propTypes = {};

export default memo(LPHistoryIcon);
