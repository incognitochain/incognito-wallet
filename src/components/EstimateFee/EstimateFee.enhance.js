/* eslint-disable import/no-cycle */
import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import accountService from '@src/services/wallet/accountService';
import { useKeyboard } from '@src/components/UseEffect/useKeyboard';
import { usePrevious } from '@src/components/UseEffect/usePrevious';
import { actionFetchFee, actionInitEstimateFee } from './EstimateFee.actions';
import { estimateFeeSelector } from './EstimateFee.selector';

const enhance = (WrappedComp) => (props) => {
  const { screen, isFetching, isFetched } = useSelector(estimateFeeSelector);
  const { amount = 0, address = '' } = props;
  const isIncognitoAddress = accountService.checkPaymentAddress(address);
  const [isKeyboardVisible] = useKeyboard();
  const prevScreen = usePrevious(screen);
  const dispatch = useDispatch();
  const handleFetchFeeData = async () => {
    try {
      await dispatch(
        actionFetchFee({
          amount,
          address,
        }),
      );
    } catch (error) {
      console.debug(error);
    }
  };
  const handleChangeForm = async () => {
    try {
      if (!address) {
        return;
      }
      let config = {};
      if (!isIncognitoAddress) {
        config = { screen: 'UnShield' };
      }
      await dispatch(actionInitEstimateFee(config));
      if (isKeyboardVisible) {
        return;
      }
      if (!isFetched) {
        return handleFetchFeeData();
      } else if (isFetched && !isFetching && prevScreen !== screen) {
        return handleFetchFeeData();
      }
    } catch (error) {
      console.debug(error);
    }
  };
  React.useEffect(() => {
    handleChangeForm();
  }, [isKeyboardVisible, address, amount, screen, isFetched, isFetching]);

  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props }} />
    </ErrorBoundary>
  );
};

enhance.propTypes = {
  amount: PropTypes.number.isRequired,
  address: PropTypes.string.isRequired,
};

export default enhance;
