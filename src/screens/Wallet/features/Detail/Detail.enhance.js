import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { withLayout_2 } from '@src/components/Layout';
import { compose } from 'recompose';
import { ExHandler } from '@src/services/exception';
import { useDispatch, useSelector } from 'react-redux';
import {
  actionFetchHistoryMainCrypto,
  actionFetchHistoryToken,
} from '@src/redux/actions/token';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import { useIsFocused } from 'react-navigation-hooks';
import { defaultAccountNameSelector } from '@src/redux/selectors/account';
import withWallet from '@screens/Wallet/features/Home/Wallet.enhance';

const enhance = (WrappedComp) => (props) => {
  const { tryLastWithdrawal } = props;
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const token = useSelector(
    selectedPrivacySeleclor.selectedPrivacyByFollowedSelector,
  );
  const account = useSelector(defaultAccountNameSelector);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const handleLoadHistory = async () => {
    try {
      if (selectedPrivacy?.isMainCrypto) {
        return await dispatch(actionFetchHistoryMainCrypto());
      }
      if (!!selectedPrivacy?.isToken && !!token?.id) {
        return await dispatch(actionFetchHistoryToken());
      }
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  React.useEffect(() => {
    if (isFocused && selectedPrivacy?.tokenId) {
      tryLastWithdrawal();
      handleLoadHistory();
    }
  }, [selectedPrivacy?.tokenId, token?.id, isFocused, account]);
  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props, handleLoadHistory }} />
    </ErrorBoundary>
  );
};

export default compose(
  withLayout_2,
  withWallet,
  enhance,
);
