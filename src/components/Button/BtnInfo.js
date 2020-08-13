import React from 'react';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from '@src/components/core';
import { InfoIcon } from '@src/components/Icons';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';

const styled = StyleSheet.create({
  btnInfo: {
    marginLeft: 5,
  },
});

const BtnInfo = (props) => {
  const navigation = useNavigation();
  const onNavTokenInfo = () => navigation.navigate(routeNames.CoinInfo);
  return (
    <TouchableOpacity
      {...{
        ...props,
        onPress:
          typeof props?.onPress === 'function'
            ? props?.onPress
            : onNavTokenInfo,
        style: [styled.btnInfo, props?.style],
      }}
    >
      <InfoIcon />
    </TouchableOpacity>
  );
};

BtnInfo.propTypes = {};

export default React.memo(BtnInfo);
