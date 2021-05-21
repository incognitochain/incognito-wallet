import React from 'react';
import { isEmpty } from 'lodash';
import { ExHandler } from '@services/exception';
import { MESSAGES } from '@src/constants';
import { useDispatch, useSelector } from 'react-redux';
import { pdexHistoriesSelector, tradeSelector } from '@screens/DexV2/components/Trade/TradeV2/Trade.selector';
import { actionClearPDexHistory, actionGetPDexHistory } from '@screens/DexV2/components/Trade/TradeV2/Trade.actions';

const withHistories = WrappedComp => (props) => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = React.useState(false);
  const [isLoadMore, setLoadMore] = React.useState(false);

  const { account } = props;
  const { reachedHistories } = useSelector(tradeSelector);

  const histories = useSelector(pdexHistoriesSelector)();

  const reload = () => {
    if (!isLoadMore && !refreshing) {
      dispatch(actionClearPDexHistory());
      setRefreshing(true);
      loadHistories();
    }
  };

  const loadHistories = async () => {
    if (!isEmpty(account)) {
      try {
        dispatch(actionGetPDexHistory());
      } catch (error) {
        new ExHandler(error, MESSAGES.CAN_NOT_GET_PDEX_TRADE_HISTORIES).showErrorToast();
      } finally {
        setRefreshing(false);
        setLoadMore(false);
      }
    }
  };

  const loadMore = () => {
    if (!isLoadMore && !refreshing && !reachedHistories) {
      setLoadMore(true);
      loadHistories();
    }
  };

  console.log('SANG isLoadMore', isLoadMore);
  return (
    <WrappedComp
      {...{
        ...props,
        histories,
        refreshing,
        isLoadMore,
        onLoadMoreHistories: loadMore,
        onReloadHistories: reload,
      }}
    />
  );
};

export default withHistories;
