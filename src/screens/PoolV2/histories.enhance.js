import React, { useCallback, useState } from 'react';
import _ from 'lodash';
import { getHistories } from '@services/api/pool';
import { ExHandler } from '@services/exception';
import { MESSAGES } from '@src/constants';
import { useFocusEffect, useNavigationParam } from 'react-navigation-hooks';
import { LIMIT } from './constants';

const withHistories = WrappedComp => (props) => {
  const [loading, setLoading] = useState(false);
  const [histories, setHistories] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(null);
  const coins = useNavigationParam('coins');

  useFocusEffect(useCallback(() => {
    reload();
  }, []));

  const { account } = props;

  const reload = () => {
    if (!loading) {
      if (page !== 1) {
        setPage(1);
      } else {
        debounceLoadHistories.cancel();
        loadHistories(account, page);
      }
    }
  };

  const loadHistories = async (account, page, total, histories) => {
    if (total !== null && histories?.length >= total) {
      return;
    }

    try {
      setLoading(true);
      const data = await getHistories(account, page, LIMIT, coins || []);
      const newData = data.items;
      const newIds = newData.map(item => item.id);
      const mergedData = _(newData)
        .concat((histories || []).filter(item => !newIds.includes(item.id)))
        .orderBy(item => item.id, 'desc')
        .uniqBy(item => item.id)
        .value();

      setTotal(data.total);
      setHistories(mergedData);
    } catch (error) {
      new ExHandler(error, MESSAGES.CAN_NOT_GET_POOL_HISTORIES).showErrorToast();
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading) {
      setPage(page + 1);
    }
  };

  const debounceLoadHistories = useCallback(_.debounce(loadHistories, 200), [histories]);

  React.useEffect(() => {
    setHistories([]);
    debounceLoadHistories.cancel();
    debounceLoadHistories(account, 1, null, []);
  }, [account.PaymentAddress]);

  React.useEffect(() => {
    if (!loading) {
      debounceLoadHistories.cancel();
      debounceLoadHistories(account, page, total, histories);
    }
  }, [page]);

  return (
    <WrappedComp
      {...{
        ...props,
        histories,
        isLoadingHistories: loading,
        onLoadMoreHistories: loadMore,
        onReloadHistories: reload,
      }}
    />
  );
};

export default withHistories;
