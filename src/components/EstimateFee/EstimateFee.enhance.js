/* eslint-disable import/no-cycle */
import ErrorBoundary from '@src/components/ErrorBoundary';
import { ExHandler } from '@src/services/exception';
import convert from '@src/utils/convert';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React from 'react';
import { useFocusEffect } from 'react-navigation-hooks';
import { useDispatch, useSelector } from 'react-redux';
import { reset } from 'redux-form';
import { actionFetchFee, actionFetchingFee } from './EstimateFee.actions';
import { estimateFeeSelector } from './EstimateFee.selector';

const enhance = (WrappedComp) => (props) => {
  const {
    amount,
    address,
    memo,
    isExternalAddress,
    isIncognitoAddress,
    isPortalToken,
    selectedPrivacy,
    childSelectedPrivacy,
  } = props;
  const dispatch = useDispatch();
  const { init } = useSelector(estimateFeeSelector);

  const validateData = () => {
    const originalAmount = convert.toOriginalAmount(
      amount,
      selectedPrivacy?.pDecimals,
    );
    const _originalAmount = Number(originalAmount);

    if (
      !init ||
      !amount ||
      !address ||
      !selectedPrivacy?.tokenId ||
      !childSelectedPrivacy ||
      _originalAmount === 0
    ) {
      return false;
    }
    return true;
  };

  const handleChangeForm = async (
    address,
    amount,
    memo,
    isExternalAddress,
    isIncognitoAddress,
    selectedPrivacy,
    childSelectedPrivacy,
  ) => {
    try {
      let screen = 'Send';
      if (childSelectedPrivacy?.networkId !== 'INCOGNITO') {
        screen = 'UnShield';
      } else {
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
        }),
      );
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };

  const _handleChangeForm = React.useRef(debounce(handleChangeForm, 1500));
  React.useEffect(() => {
    if (validateData()) {
      dispatch(actionFetchingFee());
      _handleChangeForm.current(
        address,
        amount,
        memo,
        isExternalAddress,
        isIncognitoAddress,
        selectedPrivacy,
        childSelectedPrivacy,
      );
    }
  }, [
    address,
    amount,
    memo,
    isExternalAddress,
    isIncognitoAddress,
    selectedPrivacy,
    childSelectedPrivacy,
  ]);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(reset('changeFee'));
    }, []),
  );

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
  selectedPrivacy: PropTypes.object,
  childSelectedPrivacy: PropTypes.object,
};

export default enhance;
