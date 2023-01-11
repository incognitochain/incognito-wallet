import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getFormSyncErrors, focus } from 'redux-form';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { compose } from 'recompose';
import { actionToggleModal } from '@src/components/Modal';
import { TradeSuccessModal, ROOT_TAB_TRADE, TAB_SWAP_ID } from '@screens/PDexV3/features/Trade';
import { NFTTokenModal } from '@screens/PDexV3/features/NFTToken';
import { LoadingContainer } from '@src/components/core';
import { actionCheckNeedFaucetPRV } from '@src/redux/actions/token';
import { nftTokenDataSelector } from '@src/redux/selectors/account';
import FaucetPRVModal from '@src/components/Modal/features/FaucetPRVModal';
import withLazy from '@src/components/LazyHoc/LazyHoc';
import useDebounceSelector from '@src/shared/hooks/debounceSelector';
import { validatePRVBalanceSelector } from '@src/redux/selectors/selectedPrivacy';
import { actionRefillPRVModalVisible } from '@src/screens/RefillPRV/RefillPRV.actions';
import { actionChangeTab } from '@src/components/core/Tabs';
import {
  formConfigs,
  HISTORY_ORDERS_STATE,
  OPEN_ORDERS_STATE,
} from './OrderLimit.constant';
import {
  orderLimitDataSelector,
  orderLimitSelector,
  sellInputAmountSelector,
} from './OrderLimit.selector';
import {
  actionInit,
  actionBookOrder,
  actionSetPoolSelected,
  actionResetOrdersHistory,
  actionFetchOrdersHistory,
} from './OrderLimit.actions';

const enhance = (WrappedComp) => (props) => {
  const dispatch = useDispatch();
  const { cfmTitle, disabledBtn, accountBalance, errorNetworkFee, networkfee } = useSelector(
    orderLimitDataSelector,
  );
  const { isFetching, isFetched } = useDebounceSelector(orderLimitSelector);
  const { nftTokenAvailable } = useDebounceSelector(nftTokenDataSelector);
  const sellInputAmount = useDebounceSelector(sellInputAmountSelector);
  const {
    isEnoughtPRVNeededAfterBurn,
    isCurrentPRVBalanceExhausted,
  } = useSelector(validatePRVBalanceSelector)(networkfee);

  const [ordering, setOrdering] = React.useState(false);
  const formErrors = useDebounceSelector((state) =>
    getFormSyncErrors(formConfigs.formName)(state),
  );
  const handleConfirm = async () => {
    try {
      if (ordering || errorNetworkFee) {
        return;
      }

      if (!isEnoughtPRVNeededAfterBurn) {
        dispatch(actionRefillPRVModalVisible(true));
        dispatch(
          actionChangeTab({ rootTabID: ROOT_TAB_TRADE, tabID: TAB_SWAP_ID }),
        );
        return;
      }
      
      await setOrdering(true);
      const fields = [
        formConfigs.selltoken,
        formConfigs.buytoken,
        formConfigs.rate,
      ];
      for (let index = 0; index < fields.length; index++) {
        const field = fields[index];
        if (formErrors[field]) {
          return dispatch(focus(formConfigs.formName, field));
        }
      }
      // if (!sellInputAmount.isMainCrypto) {
      //   const needFaucet = await dispatch(
      //     actionCheckNeedFaucetPRV(<FaucetPRVModal />, accountBalance),
      //   );
      //   if (needFaucet) {
      //     return;
      //   }
      // }
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
                title="Order placed!"
                desc={cfmTitle}
                sub="Your balance will update as the order fills."
                handleTradeSucesss={() => {
                  console.log('book order limit');
                }}
              />
            ),
            visible: true,
          }),
        );
      }
    } catch {
      //
    } finally {
      setOrdering(false);
    }
  };
  const onRefresh = () => {
    dispatch(actionInit(true, true));
    dispatch(actionFetchOrdersHistory(HISTORY_ORDERS_STATE));
    dispatch(actionFetchOrdersHistory(OPEN_ORDERS_STATE));
  };
  const callback = async (poolId) => {
    dispatch(actionResetOrdersHistory());
    await dispatch(actionSetPoolSelected(poolId));
    dispatch(actionInit(true));
  };

  if (isFetching && !isFetched) {
    return <LoadingContainer />;
  }
  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props, handleConfirm, onRefresh, callback }} />
    </ErrorBoundary>
  );
};

export default compose(withLazy, enhance);
