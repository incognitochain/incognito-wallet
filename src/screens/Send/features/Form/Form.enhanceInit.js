/* eslint-disable import/no-cycle */
import React from 'react';
import {
  actionInit,
  actionInitEstimateFee,
  actionFetchedMaxFeePrv,
  actionFetchedMaxFeePToken,
} from '@src/components/EstimateFee/EstimateFee.actions';
import {
  selectedPrivacySelector,
  accountSelector,
  sharedSelector,
} from '@src/redux/selectors';
import { LoadingContainer } from '@src/components/core';
import { usePrevious } from '@src/components/UseEffect/usePrevious';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useDispatch, useSelector } from 'react-redux';
import { formValueSelector, reset } from 'redux-form';
import { estimateFeeSelector } from '@src/components/EstimateFee/EstimateFee.selector';
import { getDefaultAccountWalletSelector } from '@src/redux/selectors/shared';
import { formName } from './Form.enhance';

export const enhanceInit = (WrappedComp) => (props) => {
  const dispatch = useDispatch();
  const [init, setInit] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(undefined);

  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const accountBalance = useSelector(
    accountSelector.defaultAccountBalanceSelector,
  );
  const oldSelectedPrivacy = usePrevious(selectedPrivacy);
  const oldAccountBalance = usePrevious(accountBalance);
  const estimateFee = useSelector(estimateFeeSelector);
  const selector = formValueSelector(formName);
  const amount = useSelector((state) => selector(state, 'amount'));
  const gettingBalance = useSelector(sharedSelector.isGettingBalance);
  const isGettingBalance = gettingBalance.includes(selectedPrivacy?.tokenId);
  const [ isPortalToken, setIsPortalToken ] = React.useState(false);
  const [ isChecking, setIsChecking ] = React.useState(false);
  const accountWallet = useSelector(getDefaultAccountWalletSelector);
  const initData = async () => {
    try {
      setInit(true);
      await dispatch(reset(formName));
      await dispatch(actionInit());
      await dispatch(actionInitEstimateFee());
      await dispatch(actionFetchedMaxFeePrv(accountBalance));
      await dispatch(actionFetchedMaxFeePToken(selectedPrivacy));
    } catch (error) {
      console.debug(error);
    } finally {
      setInit(false);
    }
  };
  const updateData = async () => {
    try {
      if (accountBalance !== oldAccountBalance) {
        await dispatch(actionFetchedMaxFeePrv(accountBalance));
      }
      if (selectedPrivacy?.amount !== oldSelectedPrivacy?.amount) {
        await dispatch(actionFetchedMaxFeePToken(selectedPrivacy));
      }
    } catch (error) {
      console.debug(error);
    }
  };
  const checkPortalToken = async () => {
    try {
      setIsChecking(true);
      const _isPortalToken = await accountWallet.handleCheckIsPortalToken({ tokenID: selectedPrivacy.tokenId });
      setIsPortalToken(_isPortalToken);
    } catch (e) {
      console.log(`Checking for portal token failed ${e && e.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  React.useEffect(() => {
    updateData();
  }, [selectedPrivacy?.tokenId, accountBalance, amount, isGettingBalance]);

  React.useEffect(() => {
    initData();
  }, [selectedPrivacy?.tokenId]);

  React.useEffect(() => {
    checkPortalToken();
  }, []);

  if (!selectedPrivacy || !estimateFee.init || init || isGettingBalance || isChecking) {
    return <LoadingContainer />;
  }
  return (
    <ErrorBoundary>
      <WrappedComp
        {...props}
        isPortalToken={isPortalToken}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </ErrorBoundary>
  );
};
