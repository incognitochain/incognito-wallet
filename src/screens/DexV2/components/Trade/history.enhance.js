import React, { useState } from 'react';
import { isEmpty } from 'lodash';
import { ExHandler } from '@services/exception';
import { MESSAGES } from '@src/constants';
import { useDispatch, useSelector } from 'react-redux';
import {
  actionClearPDexHistory,
  actionGetPDexHistory as getPDexHistory
} from '@screens/DexV2/components/Trade/TradeV2/Trade.actions';
import { pdexHistoriesSelector } from '@screens/DexV2/components/Trade/TradeV2/Trade.selector';

const withHistory = WrappedComp => (props) => {
  const { account, wallet } = props;
  const dispatch = useDispatch();
  const histories = useSelector(pdexHistoriesSelector)();
  const [loading, setLoading] = useState(false);

  const loadHistories = async () => {
    if (!isEmpty(account)) {
      try {
        setLoading(true);
        dispatch(actionClearPDexHistory());
        await dispatch(getPDexHistory());
      } catch (error) {
        new ExHandler(error, MESSAGES.CAN_NOT_GET_PDEX_TRADE_HISTORIES).showErrorToast();
      } finally {
        setLoading(false);
      }
    }
  };

  React.useEffect(() => {
    if (!loading) {
      loadHistories().then();
    }
    return () => {
      dispatch(actionClearPDexHistory());
    };
  }, [account, wallet]);

  return (
    <WrappedComp
      {...{
        ...props,
        histories,
        loadHistories,
      }}
    />
  );
};

export default withHistory;
