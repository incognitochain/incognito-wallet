import ErrorBoundary from '@src/components/ErrorBoundary';
import { withLayout_2 } from '@src/components/Layout';
import { withTokenVerified } from '@src/components/Token';
import withTokenSelect from '@src/components/TokenSelect/TokenSelect.enhance';
import { useDispatch } from 'react-redux';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import PropTypes from 'prop-types';
import { selectedPrivacySelector } from '@src/redux/selectors';
import useDebounceSelector from '@src/shared/hooks/debounceSelector';
import React from 'react';
import { compose } from 'recompose';
import { PRV_ID } from '@src/screens/DexV2/constants';
import { requestUpdateMetrics } from '@src/redux/actions/app';
import { ANALYTICS } from '@src/constants';

const enhance = (WrappedComp) => (props) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { allTokens, isTokenSelectable } = props;
  const getPrivacyDataByTokenID = useDebounceSelector(
    selectedPrivacySelector.getPrivacyDataByTokenID,
  );
  const availableTokens = React.useMemo(() => {
    return allTokens
      .map((token) => getPrivacyDataByTokenID(token?.tokenId))
      .filter((token) => token?.isDeposable);
  }, [allTokens.length]);
  const handleWhyShield = () => navigation.navigate(routeNames.WhyShield);
  const handleShield = async (item) => {
    try {
      if (!isTokenSelectable(item?.tokenId)) {
        return;
      }
      setTimeout(() => {
        dispatch(requestUpdateMetrics(ANALYTICS.ANALYTIC_DATA_TYPE.SHIELD));
      }, 300);
      navigation.navigate(routeNames.ChooseNetworkForShield, {
        tokenSelected: item,
      });
    } catch (error) {
      console.debug('SHIELD ERROR', error);
    }
  };
  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          availableTokens,
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
  (Comp) => (props) => <Comp {...{ ...props, onlyPToken: true }} />,
  withTokenSelect,
  enhance,
  withTokenVerified,
);
