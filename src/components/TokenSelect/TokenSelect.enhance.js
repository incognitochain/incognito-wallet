import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import _ from 'lodash';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { Toast, View } from '@components/core';
import {
  selectedPrivacySeleclor,
  tokenSeleclor,
  settingsSelector,
} from '@src/redux/selectors';
import VerifiedText from '@components/VerifiedText/index';
import TokenNetworkName from '@components/TokenNetworkName/index';
import { setSelectedPrivacy } from '@src/redux/actions/selectedPrivacy';
import CryptoIcon from '@components/CryptoIcon';
import { COINS } from '@src/constants';
import PropTypes from 'prop-types';

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
    settings,
    getPrivacyDataByTokenID,
  } = useSelector(state => ({
    pTokens: tokenSeleclor.pTokens(state),
    internalTokens: tokenSeleclor.internalTokens(state),
    getPrivacyDataByTokenID: selectedPrivacySeleclor.getPrivacyDataByTokenID(
      state,
    ),
    settings: settingsSelector.settings(state),
  }));
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
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
    if (
      settings.disableDecentralized &&
      onlyPToken &&
      tokenData?.isDecentralized
    ) {
      Toast.showError(
        'Incognito for smart contracts is coming soon! In preparation, shield, receive-out network, and send-out network features have been temporarily disabled. All features will be re-enabled on 15 April. Thanks for your patience.',
      );
      return false;
    }

    return true;
  };

  const selectToken = tokenId => {
    if (isTokenSelectable(tokenId)) {
      onSelect(tokenId);
    }
  };

  React.useEffect(() => {
    if (
      !isTokenSelectable(selectedPrivacy?.tokenId) &&
      allTokens &&
      allTokens.length > 0
    ) {
      onSelect(allTokens[0].id);
    }
  }, [selectedPrivacy, allTokens]);

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
        {...{ ...props, allTokens, menu, handleSearch, handleClearSearch }}
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
