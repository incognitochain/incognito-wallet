import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useSelector, useDispatch } from 'react-redux';
import LoadingContainer from '@src/components/LoadingContainer';
import { shieldSelector } from '@screens/Shield/Shield.selector';
import { compose } from 'recompose';
import { withLayout_2 } from '@src/components/Layout';
import { actionFetch as fetchDataShield } from '@screens/Shield/Shield.actions';
import { selectedPrivacySeleclor } from '@src/redux/selectors';

const enhance = WrappedComp => props => {
  const { isFetching, isFetched } = useSelector(shieldSelector);
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const hasError = !isFetched && !isFetching;
  const dispatch = useDispatch();
  const handleShield = async () =>
    await dispatch(fetchDataShield({ tokenId: selectedPrivacy?.tokenId }));
  if (isFetching) {
    return <LoadingContainer />;
  }
  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props, hasError, handleShield }} />
    </ErrorBoundary>
  );
};

export default compose(
  withLayout_2,
  enhance,
);
