import React from 'react';
import PropTypes from 'prop-types';
import HistoryList from '@src/components/HistoryList';
import { useSelector } from 'react-redux';
import { tokenSelector } from '@src/redux/selectors';
import withHistoryToken from './HistoryToken.enhance';
import EmptyHistory from './HistoryToken.empty';

const HistoryToken = (props) => {
  const { histories } = useSelector(tokenSelector.historyTokenSelector);
  const { isFetching, oversize } = useSelector(
    tokenSelector.receiveHistorySelector,
  );
  const {
    handleCancelEtaHistory,
    handleLoadHistory,
    showEmpty,
    refreshing,
    handleRefresh,
  } = props;
  return (
    <HistoryList
      histories={histories}
      onCancelEtaHistory={handleCancelEtaHistory}
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

HistoryToken.propTypes = {
  handleCancelEtaHistory: PropTypes.func.isRequired,
  handleLoadHistory: PropTypes.func.isRequired,
  showEmpty: PropTypes.bool.isRequired,
  refreshing: PropTypes.bool.isRequired,
  handleRefresh: PropTypes.func.isRequired,
};

export default withHistoryToken(HistoryToken);
