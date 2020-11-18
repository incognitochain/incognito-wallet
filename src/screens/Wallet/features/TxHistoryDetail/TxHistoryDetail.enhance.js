import React, { useCallback, useEffect } from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { compose } from 'recompose';
import { withLayout_2 } from '@src/components/Layout';
import { LoadingContainer } from '@src/components/core';
import { useDispatch, useSelector } from 'react-redux';
import { walletSelector } from '@src/redux/selectors/wallet';
import { updateHistoryStatus } from '@src/services/wallet/WalletService';
import {
  selectedPrivacySeleclor,
  tokenSeleclor
} from '@src/redux/selectors';
import {
  actionFetchHistoryMainCrypto,
  actionFetchHistoryToken
} from '@src/redux/actions/token';
import { ExHandler } from '@services/exception';
import withPullRefresh from '@screens/Wallet/features/TxHistoryDetail/TxHistoryDetail.enhanceRefresh';
import {
  txHistoryDetailViewerSelector
} from '@screens/Wallet/features/TxHistoryDetail/TxHistoryDetail.selector';
import {
  clearHistoryDetail,
  updateHistoryDetail
} from '@screens/Wallet/features/TxHistoryDetail/TxHistoryDetail.actions';
import Header from '@components/Header';
import routeNames from '@routers/routeNames';

const enhance = (WrappedComp) => (props) => {
  const data            = useNavigationParam('data');
  const history         = data?.history;
  const historyId       = history?.id;
  const historyData     = useSelector(txHistoryDetailViewerSelector);
  const wallet          = useSelector(walletSelector);
  const navigation      = useNavigation();
  const dispatch        = useDispatch();
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const token           = useSelector(selectedPrivacySeleclor.selectedPrivacyByFollowedSelector);
  const {
    isFetching,
    isFetched,
    histories
  } = useSelector(tokenSeleclor.historyTokenSelector);

  /*
  * Action
  * */
  const handleFetchHistory = async () => {
    try {
      if (selectedPrivacy?.isMainCrypto) {
        await dispatch(actionFetchHistoryMainCrypto());
      }
      if (!!selectedPrivacy?.isToken && !!token?.id) {
        await dispatch(actionFetchHistoryToken());
      }
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };

  const onRetryHistoryStatus = async () => {
    try {
      if (historyId) {
        await updateHistoryStatus(wallet, historyId);
        await handleFetchHistory();
      }
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };

  const onGoBack = useCallback(() => {
    navigation.navigate(routeNames.WalletDetail);
  }, []);


  /*
  * Handle fetch data showing
  * */
  useEffect(() => {
    if(!isFetching && isFetched && histories) {
      dispatch(updateHistoryDetail(historyId));
    }
  }, [isFetching, isFetched, histories]);

  /*
  * Handle clear data
  * */
  useEffect(() => {
    return () => {
      dispatch(clearHistoryDetail());
    };
  }, []);

  return (
    <ErrorBoundary>
      <Header title="Transaction details" onGoBack={onGoBack} />
      {
        !historyData
          ? (<LoadingContainer />)
          : (
            <WrappedComp {...{
              ...props,
              navigation,
              data: historyData,
              onRetryHistoryStatus,
              showReload: historyData && historyData.showReload,
              fetchingHistory: isFetching,
              historyId
            }}
            />
          )
      }
    </ErrorBoundary>
  );
};

export default compose(
  withLayout_2,
  withPullRefresh,
  enhance,
);
