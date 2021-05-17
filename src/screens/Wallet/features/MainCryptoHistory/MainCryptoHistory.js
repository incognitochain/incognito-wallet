import React, { memo } from 'react';
import HistoryList, { useHistoryList } from '@src/components/HistoryList';
import { useDispatch, useSelector } from 'react-redux';
import { accountSelector, tokenSelector } from '@src/redux/selectors';
import { actionFetchHistoryMainCrypto } from '@src/redux/actions/token';
import { ExHandler } from '@src/services/exception';
import { getBalance as getAccountBalance } from '@src/redux/actions/account';
import withMainCryptoHistory from './MainCryptoHistory.enhance';
import EmptyHistory from './MainCryptoHistory.empty';

const MainCryptoHistory = () => {
  const account = useSelector(accountSelector.defaultAccountSelector);
  const { histories } = useSelector(tokenSelector.historyTokenSelector);
  const { isFetching, oversize } = useSelector(
    tokenSelector.receiveHistorySelector,
  );
  const dispatch = useDispatch();
  const handleLoadHistory = (refreshing) => {
    try {
      dispatch(actionFetchHistoryMainCrypto(refreshing));
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  const handleLoadBalance = () => {
    try {
      dispatch(getAccountBalance(account));
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
    <HistoryList
      histories={histories}
      onRefreshHistoryList={handleRefresh}
      onLoadmoreHistory={() => !oversize && handleLoadHistory(false)}
      refreshing={refreshing}
      loading={isFetching}
      renderEmpty={() => <EmptyHistory />}
      showEmpty={showEmpty}
      oversize={oversize}
    />
  );
};

MainCryptoHistory.propTypes = {};

export default withMainCryptoHistory(memo(MainCryptoHistory));
