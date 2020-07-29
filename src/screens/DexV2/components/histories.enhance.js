import React, { useCallback, useState } from 'react';
import _ from 'lodash';
import { getHistories } from '@services/api/pdefi';
import { ExHandler } from '@services/exception';
import { MESSAGES } from '@src/constants';
import { useFocusEffect } from 'react-navigation-hooks';
import { LIMIT } from '@screens/DexV2/constants';

const withHistories = WrappedComp => (props) => {
  const [loading, setLoading] = useState(false);
  const [histories, setHistories] = useState([]);
  const [page, setPage] = useState(1);

  useFocusEffect(useCallback(() => {
    reload();
  }, []));

  const { accounts, tokens } = props;

  const reload = () => {
    if (!loading) {
      if (page !== 1) {
        setPage(1);
      } else {
        loadHistories();
      }
    }
  };

  const loadHistories = async () => {
    if (!_.isEmpty(accounts) && !_.isEmpty(tokens)) {
      try {
        setLoading(true);
        const newData = await getHistories(accounts, tokens, page, LIMIT);
        const newIds = newData.map(item => item.id);
        const mergedData = _(newData)
          .concat(histories.filter(item => !newIds.includes(item.id)))
          .orderBy(item => item.id, 'desc')
          .uniqBy(item => item.id)
          .value();

        setHistories(mergedData);
      } catch (error) {
        new ExHandler(error, MESSAGES.CAN_NOT_GET_PDEX_TRADE_HISTORIES).showErrorToast();
      } finally {
        setLoading(false);
      }
    }
  };

  const loadMore = () => {
    if (!loading) {
      const isFullPage = (histories || []).length % LIMIT === 0;
      const nextPage = Math.floor(histories.length / LIMIT) + (isFullPage ? 1 : 0);
      setPage(nextPage);
    }
  };

  React.useEffect(() => {
    if (!loading) {
      loadHistories();
    }
  }, [accounts, tokens, page]);

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
