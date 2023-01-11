
import RefillPRV from '@src/components/RefillPRV';
import React from 'react';

import routeNames from '@src/router/routeNames';
import { useNavigation } from 'react-navigation-hooks';
import { useDispatch, useSelector } from 'react-redux';
import { actionRefillPRVModalVisible } from './RefillPRV.actions';
import { modalVisibleSelector } from './RefillPRV.selector';
import enhance from './RefillPRV.enhance';

const RefillPRVModal = () => {

  const isVisible = useSelector(modalVisibleSelector);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const cancelOnClick = async () => {
    console.log(' TO DO ');
  };

  const onTouchOutside = async () => {
    console.log(' TO DO ');
  };

  const confirmOnClick = async () => {

    dispatch(actionRefillPRVModalVisible(false));
  // await dispatch(actionRefillPRVModalVisible(false));
    navigation.navigate(routeNames.Trade, {
      data: {},
    });
  };

  // if (isVisible) return null

  return (
    <RefillPRV
      isVisible={isVisible}
      cancelOnClick={cancelOnClick}
      confirmOnClick={confirmOnClick}
      onTouchOutside={onTouchOutside}
    />
);
};

export default enhance(RefillPRVModal);
