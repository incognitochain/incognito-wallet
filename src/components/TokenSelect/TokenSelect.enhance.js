import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import _ from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { View } from '@components/core';
import {
  selectedPrivacySelector,
  tokenSelector,
  settingsSelector,
} from '@src/redux/selectors';
import VerifiedText from '@components/VerifiedText/index';
import TokenNetworkName from '@components/TokenNetworkName/index';
import { setSelectedPrivacy } from '@src/redux/actions/selectedPrivacy';
import CryptoIcon from '@components/CryptoIcon';
import { COINS } from '@src/constants';
import PropTypes from 'prop-types';
import useFeatureConfig from '@src/shared/hooks/featureConfig';
import appConstant from '@src/constants/app';

const generateMenu = (tokens, onSelect) => {
  const newMenu = [];

  if (!tokens) {
    return newMenu;
  }

  tokens.slice(0, 10).forEach(token => {
    newMenu.push({
      id: token.id,
      icon: (
        <View style={{ marginTop: 8 }}>
          <CryptoIcon tokenId={token.id} size={30} />
        </View>
      ),
      label: (
        <VerifiedText text={token.displaySymbol} isVerified={token.verified} />
      ),
      desc: <TokenNetworkName id={token.id} />,
      handlePress: onSelect,
    });
  });

  return newMenu;
};

const enhance = WrappedComp => props => {
  const { onSelect, onlyPToken, showOriginalSymbol } = props;
  const [menu, setMenu] = React.useState([]);
  const [allTokens, setAllTokens] = React.useState([]);
  const {
    pTokens,
    internalTokens,
    getPrivacyDataByTokenID,
  } = useSelector(state => ({
    pTokens: tokenSelector.pTokens(state),
    internalTokens: tokenSelector.internalTokens(state),
    getPrivacyDataByTokenID: selectedPrivacySelector.getPrivacyDataByTokenID(
      state,
    ),
    settings: settingsSelector.settings(state),
  }));
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const [onCentralizedPress, isCentralizedDisabled] = useFeatureConfig(appConstant.DISABLED.SHIELD_CENTRALIZED);
  const [onDecentralizedPress, isDecentralizedDisabled] = useFeatureConfig(appConstant.DISABLED.SHIELD_DECENTRALIZED);
  const dispatch = useDispatch();

  React.useEffect(() => {
    let allTokens;
    if (onlyPToken) {
      allTokens = _(pTokens).map(item => ({
        ...item,
        id: item.tokenId,
        displaySymbol: showOriginalSymbol ? item.symbol : item.pSymbol,
      }));
    } else {
      allTokens = _(internalTokens)
        .filter(token => token.name && token.symbol)
        .filter(item => !pTokens.find(i => i.tokenId === item.id))
        .concat(
          pTokens.map(item => ({
            ...item,
            id: item.tokenId,
          })),
        )
        .map(item => ({
          ...item,
          displaySymbol: showOriginalSymbol
            ? item.symbol
            : item.pSymbol || item.symbol,
        }));
    }

    allTokens = allTokens
      .orderBy(item => COINS.POPULAR_COIN_IDS.indexOf(item.id), 'desc')
      .uniqBy(item => item?.id)
      .value();

    if (!onlyPToken) {
      allTokens = [
        {
          id:
            '0000000000000000000000000000000000000000000000000000000000000004',
          name: 'Incognito',
          displayName: 'Privacy',
          symbol: 'PRV',
          displaySymbol: 'PRV',
          pDecimals: 9,
          originalSymbol: 'PRV',
          verified: true,
        },
        ...allTokens,
      ];
    }

    if (onlyPToken && !selectedPrivacy.isPToken) {
      const firstPToken = allTokens.find(item =>
        pTokens.find(token => token.tokenId === item.id),
      );

      if (firstPToken) {
        dispatch(setSelectedPrivacy(firstPToken.id));
      } else {
        dispatch(setSelectedPrivacy(pTokens[0].tokenId));
      }
    }

    setAllTokens(allTokens);
  }, [internalTokens, pTokens]);

  const isTokenSelectable = tokenId => {
    if (!tokenId) {
      return false;
    }

    const tokenData = getPrivacyDataByTokenID(tokenId);
    if (onlyPToken) {
      if (isDecentralizedDisabled && tokenData?.isDecentralized) {
        onDecentralizedPress();
        return false;
      }

      if (isCentralizedDisabled && tokenData?.isCentralized) {
        onCentralizedPress();
        return false;
      }
    }

    return true;
  };

  const selectToken = tokenId => {
    if (isTokenSelectable(tokenId)) {
      onSelect(tokenId);
    }
  };

  const handleSearch = text => {
    if (text) {
      const searchText = _.toLower(_.trim(text));
      const tokens = _.uniqBy(allTokens, 'id').filter(
        item =>
          _.toLower(item.name).includes(searchText) ||
          _.toLower(item.symbol).includes(searchText),
      );

      const newMenu = generateMenu(tokens, selectToken);
      setMenu(newMenu);
    } else {
      setMenu(generateMenu(allTokens, selectToken));
    }
  };

  const handleClearSearch = () => {
    handleSearch('');
  };

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          allTokens,
          menu,
          handleSearch,
          handleClearSearch,
          isTokenSelectable,
        }}
      />
    </ErrorBoundary>
  );
};

enhance.propTypes = {
  onlyPToken: PropTypes.bool,
  showOriginalSymbol: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
};

enhance.defaultProps = {
  onlyPToken: false,
  showOriginalSymbol: false,
};

export default enhance;
