import routeNames from '@routers/routeNames';
import ErrorBoundary from '@src/components/ErrorBoundary';
import UnifiedInforAlert from '@src/components/UnifiedInforAlert';
import { getCurrentPaymentAddressSelector } from '@src/redux/selectors/account';
import React from 'react';
import { useNavigation, useFocusEffect } from 'react-navigation-hooks';
import { useDispatch, useSelector } from 'react-redux';
import { actionSaveUnifiedAlertStateById } from './Swap.actions';

import { isToggleUnifiedInfoSelector } from './Swap.selector';

const enhanceUnifiedAlert = (WrappedComp) => (props) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isToggleUnifiedInfor = useSelector(isToggleUnifiedInfoSelector);
  const currentPaymentAddress = useSelector(getCurrentPaymentAddressSelector);

  // console.log('UnifiedAlert   ', {
  //   isToggleUnifiedInfor,
  // });

  const saveAnswerAction = (answer) =>
    dispatch(
      actionSaveUnifiedAlertStateById({
        paymentAddress: currentPaymentAddress,
        timeStamp: new Date().getTime(),
        answer,
      }),
    );

  const cancelOnClick = () => {
    saveAnswerAction(false);
  };

  const confirmOnClick = () => {
    saveAnswerAction(true);
    navigation.navigate(routeNames.ConvertToUnifiedToken);
  };

  const onTouchOutside = () => {
    console.log('onTouchOutside TO DO');
  };

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
        }}
      />
      {isToggleUnifiedInfor && (
      <UnifiedInforAlert
        isVisible={isToggleUnifiedInfor}
        cancelOnClick={cancelOnClick}
        confirmOnClick={confirmOnClick}
        onTouchOutside={onTouchOutside}
      />
)}
    </ErrorBoundary>
  );
};

export default enhanceUnifiedAlert;
