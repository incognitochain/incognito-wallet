import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useSelector, useDispatch } from 'react-redux';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-cycle
import { actionFetchFee } from './EstimateFee.actions';
import { estimateFeeSelector } from './EstimateFee.selector';

const enhance = WrappedComp => props => {
  const { init } = useSelector(estimateFeeSelector);
  const { amount = 0, address = '', isFormValid = false } = props;
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const dispatch = useDispatch();
  const handleEstimateFee = async () => {
    if (isFormValid) {
      await dispatch(
        actionFetchFee({
          amount,
          address,
        }),
      );
    }
  };
  const _handleEstimateFee = debounce(handleEstimateFee, 1000);
  React.useEffect(() => {
    if (init) {
      _handleEstimateFee();
    }
  }, [amount, address, selectedPrivacy?.tokenId]);
  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props }} />
    </ErrorBoundary>
  );
};

enhance.propTypes = {
  amount: PropTypes.number.isRequired,
  address: PropTypes.string.isRequired,
  isFormValid: PropTypes.bool.isRequired,
};

export default enhance;
