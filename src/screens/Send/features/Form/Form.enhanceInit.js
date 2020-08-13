/* eslint-disable import/no-cycle */
import React from 'react';
import {
  actionInit,
  actionInitEstimateFee,
  actionFetchedMaxFeePrv,
  actionFetchedMaxFeePToken,
} from '@src/components/EstimateFee/EstimateFee.actions';
import { selectedPrivacySeleclor, accountSeleclor } from '@src/redux/selectors';
import { LoadingContainer } from '@src/components/core';
import { usePrevious } from '@src/components/UseEffect/usePrevious';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useDispatch, useSelector } from 'react-redux';
import { formValueSelector, reset } from 'redux-form';
import { estimateFeeSelector } from '@src/components/EstimateFee/EstimateFee.selector';
import { formName } from './Form.enhance';

export const enhanceInit = (WrappedComp) => (props) => {
  const dispatch = useDispatch();
  const [init, setInit] = React.useState(false);
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const accountBalance = useSelector(
    accountSeleclor.defaultAccountBalanceSelector,
  );
  const oldSelectedPrivacy = usePrevious(selectedPrivacy);
  const oldAccountBalance = usePrevious(accountBalance);
  const estimateFee = useSelector(estimateFeeSelector);
  const selector = formValueSelector(formName);
  const amount = useSelector((state) => selector(state, 'amount'));

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

  React.useEffect(() => {
    updateData();
  }, [selectedPrivacy?.tokenId, accountBalance, amount]);

  React.useEffect(() => {
    initData();
  }, [selectedPrivacy?.tokenId]);

  if (!selectedPrivacy || !estimateFee.init || init) {
    return <LoadingContainer />;
  }
  return (
    <ErrorBoundary>
      <WrappedComp {...props} />
    </ErrorBoundary>
  );
};
