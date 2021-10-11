import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { compose } from 'recompose';
import {useDispatch, useSelector} from 'react-redux';
import {defaultAccountSelector} from '@src/redux/selectors/account';
import { actionFreeHomePDexV3, actionRefresh } from './Home.actions';

const enhance = (WrappedComp) => (props) => {
  const dispatch = useDispatch();
  const account = useSelector(defaultAccountSelector);
  const handleOnRefresh = () => {
    dispatch(actionRefresh());
  };
  React.useEffect(() => {
    handleOnRefresh();
    return () => {
      dispatch(actionFreeHomePDexV3());
    };
  }, [account.paymentAddress]);
  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props, handleOnRefresh }} />
    </ErrorBoundary>
  );
};

export default compose(
  enhance,
);
