import React, {memo} from 'react';
import PropTypes from 'prop-types';
import style from '@screens/Node/style';
import { SuccessModal } from '@src/components';

const ModalMissingSetup = (props) => {
  const {
    visible,
    onGoBack,
    onResume
  } = props;

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
  visible:  PropTypes.bool.isRequired,
  onGoBack: PropTypes.func.isRequired,
  onResume: PropTypes.func.isRequired
};

export default memo(ModalMissingSetup);