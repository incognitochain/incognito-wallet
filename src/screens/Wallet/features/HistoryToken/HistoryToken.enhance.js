import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { ExHandler } from '@src/services/exception';
import { tokenSeleclor } from '@src/redux/selectors';
import { useSelector, useDispatch } from 'react-redux';
import { removeHistory } from '@src/services/api/history';
import { Toast } from '@src/components/core';
import { actionFetchHistory } from '@src/redux/actions/token';
import EmptyHistory from '@src/components/HistoryList/EmptyHistory';

const enhance = WrappedComp => props => {
  const { isEmpty, isFetching } = useSelector(
    tokenSeleclor.historyTokenSelector,
  );
  const dispatch = useDispatch();
  const handleLoadHistory = async () => {
    try {
      await dispatch(actionFetchHistory());
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  const handleCancelEtaHistory = async history => {
    try {
      const data = await removeHistory({
        historyId: history?.id,
        currencyType: history?.currencyType,
        isDecentralized: history?.decentralized,
      });
      if (data) {
        Toast.showSuccess('Canceled');
        await handleLoadHistory();
      }
    } catch (e) {
      new ExHandler(
        e,
        'Cancel this transaction failed, please try again.',
      ).showErrorToast();
    }
  };
  if (isEmpty) {
    return <EmptyHistory />;
  }
  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          handleCancelEtaHistory,
        }}
      />
    </ErrorBoundary>
  );
};

export default enhance;
