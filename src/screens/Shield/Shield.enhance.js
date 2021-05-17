import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { compose } from 'recompose';
import { withLayout_2 } from '@src/components/Layout';
import withTokenSelect from '@src/components/TokenSelect/TokenSelect.enhance';
import { useSelector } from 'react-redux';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import PropTypes from 'prop-types';
import { selectedPrivacySelector } from '@src/redux/selectors';
import { withTokenVerified } from '@src/components/Token';

const enhance = (WrappedComp) => (props) => {
  const navigation = useNavigation();
  const { allTokens, isTokenSelectable } = props;
  const getPrivacyDataByTokenID = useSelector(
    selectedPrivacySelector.getPrivacyDataByTokenID,
  );
  const availableTokens = allTokens
    .map((token) => getPrivacyDataByTokenID(token?.tokenId))
    .filter((token) => token?.isDeposable);
  const handleWhyShield = () => navigation.navigate(routeNames.WhyShield);
  const handleShield = async (item) => {
    try {
      if (!isTokenSelectable(item?.tokenId)) {
        return;
      }
      navigation.navigate(routeNames.ShieldGenQRCode, {
        tokenId: item?.tokenId,
        tokenSymbol: item?.externalSymbol || item?.symbol,
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
