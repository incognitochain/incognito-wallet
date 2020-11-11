import React, { useState } from 'react';
import { withLayout_2 } from '@src/components/Layout';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import { getTxTransactionByHash } from '@src/services/wallet/RpcClientService';
import { useFocusEffect, useNavigationParam } from 'react-navigation-hooks';
import { useSelector } from 'react-redux';
import { compose } from 'recompose';
import ErrorBoundary from '@src/components/ErrorBoundary';
import formatUtil from '@src/utils/format';
import { endsWith } from 'lodash';
import { getTypeOfHistoryReceive } from './TxHistoryReceive.utils';

const enhance = (WrappedComp) => (props) => {
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const data = useNavigationParam('data');
  const { history: _history, ...rest } = data;
  const isHistoryReceived = _history.isHistoryReceived;
  const [historyReceive, setHistoryReceive] = useState({
    loading: false,
    history: null,
  });
  const { history, loading } = historyReceive;
  const handleFetchHistoryReceive = async () => {
    const { loading } = historyReceive;
    const txId = _history?.id;
    let tx;
    if (loading || !txId) {
      return;
    }
    let history = { ..._history };
    let typeOf = `Receive ${selectedPrivacy?.externalSymbol ||
      selectedPrivacy?.symbol}`;
    try {
      await setHistoryReceive({
        ...historyReceive,
        loading: true,
      });
      tx = await getTxTransactionByHash(txId);
      if (tx) {
        typeOf = getTypeOfHistoryReceive({
          selectedPrivacy,
          tx,
        });
      }
    } catch (error) {
      console.debug('ERROR', error);
    } finally {
      await setHistoryReceive({
        ...historyReceive,
        loading: false,
        history: {
          ...history,
          typeOf,
          time: formatUtil.formatDateTime(
            endsWith(tx?.LockTime, 'Z')
              ? tx?.LockTime
              : `${tx?.LockTime}Z` || history?.time,
          ),
        },
      });
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      if (isHistoryReceived) {
        handleFetchHistoryReceive();
      }
    }, [_history?.id]),
  );

  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props, loading, history, ...rest }} />
    </ErrorBoundary>
  );
};

export default compose(
  withLayout_2,
  enhance,
);
