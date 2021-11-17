import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { withLayout_2 } from '@src/components/Layout';
import { compose } from 'recompose';
import { useDispatch, useSelector } from 'react-redux';
import { ExHandler } from '@src/services/exception';
import { activedTabSelector } from '@src/components/core/Tabs';
import {
  actionInitSwapForm,
  actionReset as actionResetSwap,
} from '@screens/PDexV3/features/Swap';
import {
  actionFetchPools,
  actionReset,
  poolsSelector,
} from '@screens/PDexV3/features/Pools';
import { actionReset as actionResetChart } from '@screens/PDexV3/features/Chart';
import {
  actionInit,
  actionReset as actionResetOrderLimit,
} from '@screens/PDexV3/features/OrderLimit';
import { NFTTokenBottomBar } from '@screens/PDexV3/features/NFTToken';
import { LoadingContainer } from '@src/components/core';
import {
  ROOT_TAB_TRADE,
  TAB_SWAP_ID,
  TAB_SELL_LIMIT_ID,
  TAB_BUY_LIMIT_ID,
  TAB_MARKET_ID,
} from './Trade.constant';

const enhance = (WrappedComp) => (props) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const { isFetching, isFetched } = useSelector(poolsSelector);
  const activedTab = useSelector(activedTabSelector)(ROOT_TAB_TRADE);
  const dispatch = useDispatch();
  const onRefresh = async () => {
    try {
      await setRefreshing(true);
      switch (activedTab) {
      case TAB_SWAP_ID: {
        await dispatch(actionInitSwapForm());
        break;
      }
      case TAB_SELL_LIMIT_ID:
      case TAB_BUY_LIMIT_ID: {
        await dispatch(actionInit());
        break;
      }
      case TAB_MARKET_ID: {
        await dispatch(actionFetchPools());
        break;
      }
      default:
        break;
      }
    } catch (error) {
      new ExHandler(error).showErrorToast();
    } finally {
      await setRefreshing(false);
    }
  };
  React.useEffect(() => {
    return () => {
      dispatch(actionReset());
      dispatch(actionResetChart());
      dispatch(actionResetOrderLimit());
      dispatch(actionResetSwap());
    };
  }, []);
  if (isFetching && !isFetched) {
    return <LoadingContainer />;
  }
  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props, refreshing, onRefresh }} />
      {(activedTab === TAB_BUY_LIMIT_ID ||
        activedTab === TAB_SELL_LIMIT_ID) && <NFTTokenBottomBar />}
    </ErrorBoundary>
  );
};

export default compose(
  withLayout_2,
  enhance,
);
