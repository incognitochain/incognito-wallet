import React, {useCallback} from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { actionUpdateMissingSetup as updateMissingSetup } from '@screens/Node/Node.actions';
import routeNames from '@routers/routeNames';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from 'react-navigation-hooks';
import { missingSetupNodeSelector } from '@screens/Node/Node.selector';
import { checkIfVerifyCodeIsExisting } from '@screens/Node/Node.utils';

const enhance = WrappedComp => props => {

  const dispatch    = useDispatch();
  const navigation  = useNavigation();

  const {
    visible,
    verifyProductCode
  } = useSelector(missingSetupNodeSelector);

  const onResume = () => {
    dispatch(updateMissingSetup({
      visible: false,
      verifyProductCode
    }));

    navigation.navigate(routeNames.RepairingSetupNode, {
      isRepairing: true,
      verifyProductCode
    });
  };

  const onGoBack = () => {
    dispatch(updateMissingSetup({
      visible: false,
      verifyProductCode
    }));
    navigation.navigate(routeNames.Home);
  };

  useFocusEffect(
    useCallback(() => {
      // Check old product code
      checkIfVerifyCodeIsExisting()
        .then(({showModal, verifyProductCode}) => {
          dispatch(updateMissingSetup({
            visible: showModal,
            verifyProductCode
          }));
        });
    }, [])
  );

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          visible,

          onResume,
          onGoBack
        }}
      />
    </ErrorBoundary>
  );
};

export default enhance;