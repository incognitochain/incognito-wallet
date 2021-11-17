import React from 'react';
import { useSelector, useDispatch, batch } from 'react-redux';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { compose } from 'recompose';
import { actionToggleModal } from '@src/components/Modal';
import { TradeSuccessModal } from '@screens/PDexV3/features/Trade';
import { nftTokenDataSelector } from '@src/redux/selectors/account';
import { NFTTokenModal } from '@screens/PDexV3/features/NFTToken';
import { LoadingContainer } from '@src/components/core';
import {
  orderLimitDataSelector,
  orderLimitSelector,
} from './OrderLimit.selector';
import {
  actionInit,
  actionBookOrder,
  actionSetPoolSelected,
  actionResetOrdersHistory,
} from './OrderLimit.actions';

const enhance = (WrappedComp) => (props) => {
  const dispatch = useDispatch();
  const { cfmTitle, disabledBtn } = useSelector(orderLimitDataSelector);
  const { nftTokenAvailable } = useSelector(nftTokenDataSelector);
  const { isFetching, isFetched } = useSelector(orderLimitSelector);
  const handleConfirm = async () => {
    try {
      if (!nftTokenAvailable) {
        return dispatch(
          actionToggleModal({
            visible: true,
            shouldCloseModalWhenTapOverlay: true,
            data: <NFTTokenModal />,
          }),
        );
      }
      if (disabledBtn) {
        return;
      }
      const tx = await dispatch(actionBookOrder());
      if (tx) {
        dispatch(
          actionToggleModal({
            data: (
              <TradeSuccessModal
                title="Order initiated!"
                desc={cfmTitle}
                sub={
                  'Your balance will update in a couple of\nminutes after the trade is finalized.'
                }
                handleTradeSucesss={() => {
                  batch(() => {
                    dispatch(actionInit());
                  });
                }}
              />
            ),
            visible: true,
          }),
        );
      }
    } catch {
      //
    }
  };
  const onRefresh = () => {
    dispatch(actionInit());
  };
  const callback = async (poolId) => {
    dispatch(actionResetOrdersHistory());
    await dispatch(actionSetPoolSelected(poolId));
    dispatch(actionInit(true));
  };
  React.useEffect(() => {
    dispatch(actionInit(true));
  }, []);
  if (isFetching && !isFetched) {
    return <LoadingContainer />;
  }
  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props, handleConfirm, onRefresh, callback }} />
    </ErrorBoundary>
  );
};

export default compose(enhance);
