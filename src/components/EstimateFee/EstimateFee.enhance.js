/* eslint-disable import/no-cycle */
import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useDispatch } from 'react-redux';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import { ExHandler } from '@src/services/exception';
import { actionFetchFee } from './EstimateFee.actions';
import { useKeyboard } from '../UseEffect/useKeyboard';

const enhance = (WrappedComp) => (props) => {
  const {
    amount,
    address,
    memo,
    isExternalAddress,
    isIncognitoAddress,
    isPortalToken,
    childSelectedPrivacy,
  } = props;
  const dispatch = useDispatch();
  const [isKeyboardVisible] = useKeyboard();
  const handleChangeForm = async (
    address,
    amount,
    memo,
    isExternalAddress,
    isIncognitoAddress,
    childSelectedPrivacy,
  ) => {
    try {
      if (!amount || !address) {
        return;
      }
      let screen = 'Send';
      if (isExternalAddress) {
        screen = 'UnShield';
      } else if (isIncognitoAddress) {
        screen = 'Send';
      }
      if (isPortalToken && screen === 'UnShield') {
        return;
      }
    
      await dispatch(
        actionFetchFee({
          amount,
          address,
          screen,
          memo,
          childSelectedPrivacy,
        }),
      );
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  const _handleChangeForm = React.useRef(debounce(handleChangeForm, 1500));
  React.useEffect(() => {
    _handleChangeForm.current(
      address,
      amount,
      memo,
      isExternalAddress,
      isIncognitoAddress,
      childSelectedPrivacy
    );
  }, [address, amount, memo, isExternalAddress, isIncognitoAddress, childSelectedPrivacy]);
  React.useEffect(() => {
    if (!isKeyboardVisible && _handleChangeForm && _handleChangeForm.current) {
      _handleChangeForm.current(
        address,
        amount,
        memo,
        isExternalAddress,
        isIncognitoAddress,
        childSelectedPrivacy
      );
    }
  }, [isKeyboardVisible]);
  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props }} />
    </ErrorBoundary>
  );
};

enhance.defaultProps = {
  memo: '',
};

enhance.propTypes = {
  amount: PropTypes.number.isRequired,
  address: PropTypes.string.isRequired,
  memo: PropTypes.string,
  isExternalAddress: PropTypes.bool.isRequired,
  isIncognitoAddress: PropTypes.bool.isRequired,
  childSelectedPrivacy: PropTypes.object,
};

export default enhance;
