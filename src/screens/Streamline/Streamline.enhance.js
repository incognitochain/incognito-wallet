import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { compose } from 'recompose';
import { withLayout_2 } from '@src/components/Layout';
import { loadAccountHistory, normalizeData } from '@src/redux/utils/token';
import { useDispatch, useSelector } from 'react-redux';
import { CONSTANT_COMMONS } from '@src/constants';
import { ExHandler } from '@src/services/exception';
import { useFocusEffect } from 'react-navigation-hooks';
import { accountSeleclor } from '@src/redux/selectors';
import { getStatusData } from '@src/components/HistoryList/HistoryList.utils';
import { clearCache } from '@src/services/cache';
import { getBalance as getAccountBalance } from '@src/redux/actions/account';
import { walletSelector } from '@src/redux/selectors/wallet';
import {
  actionInitProccess,
  actionTogglePending,
  actionRemoveLocalUTXOs,
} from './Streamline.actions';
import { useStreamLine } from './Streamline.useStreamline';

const enhance = (WrappedComp) => (props) => {
  const account = useSelector(accountSeleclor.defaultAccountSelector);
  const wallet = useSelector(walletSelector);
  const dispatch = useDispatch();
  const [state, setState] = React.useState({
    refresh: false,
    loading: undefined,
  });
  const { refresh, loading } = state;
  const { data, times } = useStreamLine();
  const handleFetchData = async () => {
    const utxos = data[(account?.paymentAddress)] || [];
    if (refresh) {
      return;
    }
    let _isPending = false;
    try {
      await setState({
        ...state,
        refresh: true,
        loading: typeof loading === 'undefined' ? true : false,
      });
      const accountHistory = await dispatch(loadAccountHistory());
      const historiesMainCrypto = normalizeData(
        accountHistory,
        CONSTANT_COMMONS.PRV.pDecimals,
        CONSTANT_COMMONS.PRV.pDecimals,
      );
      const histories = historiesMainCrypto
        ?.filter((history) =>
          utxos.find((txId) => txId === history?.incognitoTxID),
        )
        .map((history) => ({ ...history, ...getStatusData(history) }));
      _isPending = histories.some(
        (history) => history?.statusMessage === 'Pending',
      );
      if (!_isPending && utxos.length > 0) {
        const payload = { address: account?.paymentAddress };
        await dispatch(actionRemoveLocalUTXOs(payload));
        const key = `balance-${wallet.Name}-${account?.accountName}-${CONSTANT_COMMONS.PRV.id}`;
        clearCache(key);
        await dispatch(getAccountBalance(account));
      }
    } catch (error) {
      new ExHandler(error).showErrorToast();
    } finally {
      dispatch(actionTogglePending(_isPending));
      setState({ ...state, refresh: false, loading: false });
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      dispatch(actionInitProccess({ times }));
      handleFetchData();
    }, [account?.accountName]),
  );

  React.useEffect(() => {
    return () => {
      dispatch(actionTogglePending(false));
    };
  }, []);

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          handleFetchData,
          refresh,
          loading,
        }}
      />
    </ErrorBoundary>
  );
};

export default compose(
  withLayout_2,
  enhance,
);
