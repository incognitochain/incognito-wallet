import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { ExHandler } from '@src/services/exception';
import { accountSelector, selectedPrivacySelector } from '@src/redux/selectors';
import { useSelector, useDispatch } from 'react-redux';
import { removeHistory } from '@src/services/api/history';
import { Toast } from '@src/components/core';
import {
  getBalance as getBalanceToken,
  actionFetchHistoryToken,
} from '@src/redux/actions/token';
import { useHistoryList } from '@src/components/HistoryList';

const enhance = (WrappedComp) => (props) => {
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const token = useSelector(
    selectedPrivacySelector.selectedPrivacyByFollowedSelector,
  );
  const signPublicKeyEncode = useSelector(
    accountSelector.signPublicKeyEncodeSelector,
  );

  const dispatch = useDispatch();
  const handleLoadHistory = async (refreshing) => {
    try {
      if (!!selectedPrivacy?.isToken && !!token?.id) {
        dispatch(actionFetchHistoryToken(refreshing));
      }
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  const handleCancelEtaHistory = async (history) => {
    try {
      const data = await removeHistory({
        historyId: history?.id,
        currencyType: history?.currencyType,
        isDecentralized: history?.decentralized,
        signPublicKeyEncode,
      });
      if (data) {
        Toast.showSuccess('Canceled');
        handleLoadHistory(true);
      }
    } catch (e) {
      new ExHandler(
        e,
        'Cancel this transaction failed, please try again.',
      ).showErrorToast();
    }
  };
  const handleLoadBalance = () => {
    try {
      if (token) {
        dispatch(getBalanceToken(token));
      }
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  const handleRefresh = () => {
    handleLoadBalance();
    handleLoadHistory(true);
  };
  const [showEmpty, refreshing] = useHistoryList({
    handleLoadHistory,
    handleLoadBalance,
  });
  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          handleCancelEtaHistory,
          handleLoadHistory,
          showEmpty,
          refreshing,
          handleRefresh,
        }}
      />
    </ErrorBoundary>
  );
};

export default enhance;
