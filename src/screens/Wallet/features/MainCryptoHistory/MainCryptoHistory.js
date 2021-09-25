import React from 'react';
import HistoryList from '@src/screens/Wallet/features/HistoryList';
import { historyTxsSelector } from '@src/redux/selectors/history';
import { useHistoryEffect } from '@src/screens/Wallet/features/History';
import { useSelector } from 'react-redux';
import { CONSTANT_COMMONS } from '@src/constants';
import EmptyHistory from './MainCryptoHistory.empty';

const filterResponseType = (h) => {
  if (!h?.metaData) {
    return true;
  }
  const metaData = JSON.parse(h?.metaData);
  const typeOf = metaData?.Type;
  // mint prv response types
  return !CONSTANT_COMMONS.RESPONSE_PRV_TYPES.includes(typeOf);
};

const MainCryptoHistory = () => {
  const { histories, isEmpty, loading, refreshing, oversize } = useSelector(
    historyTxsSelector,
  );
  const { handleRefresh } = useHistoryEffect();
  const tempHistories = histories.filter(filterResponseType);
  return (
    <HistoryList
      histories={tempHistories}
      onRefreshHistoryList={handleRefresh}
      refreshing={refreshing}
      loading={loading}
      renderEmpty={() => <EmptyHistory />}
      showEmpty={isEmpty}
      oversize={oversize}
    />
  );
};

MainCryptoHistory.propTypes = {};

export default MainCryptoHistory;
