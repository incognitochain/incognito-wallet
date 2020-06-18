import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useSelector, useDispatch } from 'react-redux';
import { ExHandler } from '@src/services/exception';
import { addressBookSelector } from './AddressBook.selector';
import { actionSyncAddressBook } from './AddressBook.actions';

const enhance = (WrappedComp) => (props) => {
  const { sync } = useSelector(addressBookSelector);
  const dispatch = useDispatch();
  const handleSyncAddressBook = async () => {
    try {
      await dispatch(actionSyncAddressBook());
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  React.useEffect(() => {
    if (!sync) {
      handleSyncAddressBook();
    }
  }, []);
  return (
    <ErrorBoundary>
      <WrappedComp {...props} />
    </ErrorBoundary>
  );
};

export default enhance;
