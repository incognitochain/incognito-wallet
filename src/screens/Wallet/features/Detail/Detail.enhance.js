import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { withLayout_2 } from '@src/components/Layout';
import { compose } from 'recompose';
import { ExHandler } from '@src/services/exception';
import { useDispatch, useSelector } from 'react-redux';
import { actionFetchHistory } from '@src/redux/actions/token';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import { useIsFocused } from 'react-navigation-hooks';

const enhance = WrappedComp => props => {
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const handleLoadHistory = async () => {
    try {
      await dispatch(actionFetchHistory());
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  React.useEffect(() => {
    if (isFocused) {
      handleLoadHistory();
    }
  }, [selectedPrivacy?.tokenId, isFocused]);
  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props, handleLoadHistory }} />
    </ErrorBoundary>
  );
};

export default compose(
  withLayout_2,
  enhance,
);
