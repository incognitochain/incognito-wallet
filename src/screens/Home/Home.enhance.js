import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { compose } from 'recompose';
import { withNavigation } from 'react-navigation';
import Modal from '@src/components/Modal';
import withFCM from '@src/screens/Notification/Notification.withFCM';

const enhance = WrappedComp => props => {
  return (
    <ErrorBoundary>
      <WrappedComp {...props} />
      <Modal />
    </ErrorBoundary>
  );
};

export default compose(
  withNavigation,
  withFCM,
  enhance,
);
