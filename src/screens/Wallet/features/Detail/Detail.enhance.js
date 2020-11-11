import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { withLayout_2 } from '@src/components/Layout';
import { compose } from 'recompose';
import { useFocusEffect } from 'react-navigation-hooks';
import withWallet from '@screens/Wallet/features/Home/Wallet.enhance';
import { useDispatch } from 'react-redux';
import {
  actionFreeReceiveHistory,
  actionFreeHistory,
} from '@src/redux/actions/token';

const enhance = (WrappedComp) => (props) => {
  const {
    retryLastTxsUnshieldDecentralized,
    retryLastTxsUnshieldCentralized,
  } = props;

  const dispatch = useDispatch();
  const handleFreeHistoryData = () => {
    try {
      dispatch(actionFreeReceiveHistory());
      dispatch(actionFreeHistory());
    } catch (error) {
      console.debug('ERROR', error);
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      retryLastTxsUnshieldCentralized();
      retryLastTxsUnshieldDecentralized();
    }, []),
  );
  React.useEffect(() => {
    return () => {
      handleFreeHistoryData();
    };
  }, []);
  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props }} />
    </ErrorBoundary>
  );
};

export default compose(
  withLayout_2,
  withWallet,
  enhance,
);
