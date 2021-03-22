import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { compose } from 'recompose';
import { withLayout_2 } from '@src/components/Layout';
import withTokenSelect from '@src/components/TokenSelect/TokenSelect.enhance';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import PropTypes from 'prop-types';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import { withTokenVerified } from '@src/components/Token';
import { CONSTANT_COMMONS } from '@src/constants';
import { setSelectedPrivacy } from '@src/redux/actions/selectedPrivacy';
import { actionFetch as fetchDataShield } from './Shield.actions';

const enhance = (WrappedComp) => (props) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { allTokens, isTokenSelectable } = props;
  const getPrivacyDataByTokenID = useSelector(
    selectedPrivacySeleclor.getPrivacyDataByTokenID,
  );
  const availableTokens = allTokens
    .map((token) => getPrivacyDataByTokenID(token?.tokenId))
    .filter((token) => token?.isDeposable);
  const handleWhyShield = () => navigation.navigate(routeNames.WhyShield);
  const handleShield = async (tokenId) => {
    try {
      if (!isTokenSelectable(tokenId)) return;
      const tokenSelected = availableTokens.find(token => token.tokenId === tokenId);

      const isEthNetwork = tokenSelected.rootNetworkName === CONSTANT_COMMONS.NETWORK_NAME.ETHEREUM;
      const routeName = isEthNetwork
        ? routeNames.BridgeShield
        : routeNames.ShieldGenQRCode;
      navigation.navigate(routeName);
      await dispatch(setSelectedPrivacy(tokenId));
      if (!isEthNetwork) {
        await dispatch(fetchDataShield({ tokenId }));
      }
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
