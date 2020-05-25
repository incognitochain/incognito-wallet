import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { compose } from 'recompose';
import { withLayout_2 } from '@src/components/Layout';
import withTokenSelect from '@src/components/TokenSelect/TokenSelect.enhance';
import { useDispatch } from 'react-redux';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { ExHandler } from '@src/services/exception';
import PropTypes from 'prop-types';
import { useSearchBox } from '@src/components/Header';
import { handleFilterTokenByKeySearch } from '@src/components/Token';
import uniqBy from 'lodash/uniqBy';
import { actionFetch as fetchDataShield } from './Shield.actions';

const enhance = WrappedComp => props => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { allTokens: tokens } = props;
  const handleWhyShield = () => navigation.navigate(routeNames.WhyShield);
  const handleShield = async tokenId => {
    try {
      navigation.navigate(routeNames.ShieldGenQRCode);
      await dispatch(fetchDataShield({ tokenId }));
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  const [result, keySearch] = useSearchBox({
    data: tokens,
    handleFilter: () => handleFilterTokenByKeySearch({ tokens, keySearch }),
  });
  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          data: uniqBy([...result], 'tokenId'),
          handleWhyShield,
          handleShield,
        }}
      />
    </ErrorBoundary>
  );
};

enhance.propTypes = {
  allTokens: PropTypes.array.isRequired,
};
export default compose(
  withLayout_2,
  Comp => props => <Comp {...{ ...props, onlyPToken: true }} />,
  withTokenSelect,
  enhance,
);
