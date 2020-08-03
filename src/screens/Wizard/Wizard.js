import React from 'react';
import WizardAnim from '@src/components/core/WizardComponent';
import { useDispatch } from 'react-redux';
import { actionShowWizardFetched } from '@screens/GetStarted';

const Wizard = () => {
  const dispatch = useDispatch();
  const handleFinish = () => dispatch(actionShowWizardFetched());
  return <WizardAnim onAnimationFinish={handleFinish} />;
};

export default React.memo(Wizard);
