import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useSelector, useDispatch } from 'react-redux';
import { availableTokensSelector } from '@src/redux/selectors/shared';
import { withLayout_2 } from '@src/components/Layout';
import { compose } from 'recompose';
import { useSearchBox } from '@src/components/Header';
import { handleFilterTokenByKeySearch } from '@src/components/Token';
import uniqBy from 'lodash/uniqBy';
import withTokenSelect from '@src/components/TokenSelect/TokenSelect.enhance';
import {
  actionAddFollowToken,
  actionRemoveFollowToken,
  actionToggleVerifiedToken,
} from '@src/redux/actions/token';
import { toggleVerifiedTokensSelector } from '@src/redux/selectors/token';

const enhance = (WrappedComp) => (props) => {
  const availableTokens = useSelector(availableTokensSelector);
  const toggleVerified = useSelector(toggleVerifiedTokensSelector);
  const tokens = availableTokens.filter((token) =>
    toggleVerified ? !!token?.isVerified : true,
  );
  const dispatch = useDispatch();
  const [result, keySearch] = useSearchBox({
    data: tokens,
    handleFilter: () => handleFilterTokenByKeySearch({ tokens, keySearch }),
  });
  const handleToggleFollowToken = async (token) => {
    try {
      if (!token?.isFollowed) {
        dispatch(actionAddFollowToken(token?.tokenId));
      } else {
        dispatch(actionRemoveFollowToken(token?.tokenId));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleFilterTokensVerified = () =>
    dispatch(actionToggleVerifiedToken());
  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          data: uniqBy([...result], 'tokenId'),
          handleToggleFollowToken,
          handleFilterTokensVerified,
          toggleVerified,
        }}
      />
    </ErrorBoundary>
  );
};

export default compose(
  withTokenSelect,
  withLayout_2,
  enhance,
);
