import React, {memo} from 'react';
import PropTypes from 'prop-types';
import style from '@screens/Node/style';
import { SuccessModal } from '@src/components';
import { useDispatch, useSelector } from 'react-redux';
import { missingSetupNodeSelector } from '@screens/Node/Node.selector';
import {
  actionUpdateMissingSetup as updateMissingSetup
} from '@screens/Node/Node.actions';
import {useNavigation} from 'react-navigation-hooks';
import routeNames from '@routers/routeNames';

const ModalMissingSetup = () => {
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

  return (
    <SuccessModal
      title="Something stopped unexpectedly"
      extraInfo="Please resume setup to bring Node online."
      visible={visible}
      successTitle="Resume"
      buttonTitle="Back"
      buttonStyle={style.button}
      onSuccess={onResume}
      closeSuccessDialog={onGoBack}
    />
  );
};

ModalMissingSetup.propTypes = {
};

export default memo(ModalMissingSetup);