import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {useSelector, shallowEqual, useDispatch} from 'react-redux';
import { View } from '@components/core';
import OptionMenu from '@components/OptionMenu';
import {selectedPrivacySeleclor, tokenSeleclor} from '@src/redux/selectors';
import {Icon} from 'react-native-elements';
import CryptoIcon from '@components/CryptoIcon';
import VerifiedText from '@components/VerifiedText/index';
import TokenNetworkName from '@components/TokenNetworkName/index';
import {setSelectedPrivacy} from '@src/redux/actions/selectedPrivacy';
import COLORS from '@src/styles/colors';
import { COINS } from '@src/constants';
import styles from './style';

const generateMenu = (tokens, onSelect) => {
  const newMenu = [];

  if (!tokens) {
    return newMenu;
  }

  tokens
    .slice(0, 10)
    .forEach(token => {
      newMenu.push({
        id: token.id,
        icon: (
          <View style={{ marginTop: 8 }}>
            <CryptoIcon tokenId={token.id} size={30} />
          </View>
        ),
        label: <VerifiedText text={token.displaySymbol} isVerified={token.verified} />,
        desc: <TokenNetworkName id={token.id} />,
        handlePress: onSelect,
      });
    });

  return newMenu;
};

const TokenSelect = ({ onSelect, onlyPToken, size, style, iconStyle, showOriginalSymbol, toggleStyle }) => {
  const [menu, setMenu] = React.useState([]);
  const [allTokens, setAllTokens] = React.useState([]);
  const { pTokens, internalTokens } = useSelector(state => ({
    pTokens: tokenSeleclor.pTokens(state),
    internalTokens: tokenSeleclor.internalTokens(state),
  }), shallowEqual);
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const dispatch = useDispatch();

  React.useEffect(() => {
    let allTokens;

    if (onlyPToken) {
      allTokens = _(pTokens)
        .map(item => ({
          ...item,
          id: item.tokenId,
          displaySymbol: showOriginalSymbol ? item.symbol : item.pSymbol,
        }));
    } else {
      allTokens = _(internalTokens)
        .filter(token => token.name && token.symbol)
        .filter(item => !pTokens.find(i => i.tokenId === item.id))
        .concat(pTokens.map(item => ({
          ...item,
          id: item.tokenId,
        })))
        .map(item => ({
          ...item,
          displaySymbol: showOriginalSymbol ? item.symbol : (item.pSymbol || item.symbol),
        }));
    }

    allTokens = allTokens
      .orderBy(item => COINS.POPULAR_COIN_IDS.indexOf(item.id), 'desc')
      .value();

    if (!onlyPToken) {
      allTokens = [{
        id: '0000000000000000000000000000000000000000000000000000000000000004',
        name: 'Incognito',
        displayName: 'Privacy',
        symbol: 'PRV',
        displaySymbol: 'PRV',
        pDecimals: 9,
        originalSymbol: 'PRV',
        verified: true,
      }, ...allTokens];
    }

    if (onlyPToken && !selectedPrivacy.isPToken) {
      const firstPToken = allTokens.find(item => pTokens.find(token => token.tokenId === item.id));

      if (firstPToken) {
        dispatch(setSelectedPrivacy(firstPToken.id));
      } else {
        dispatch(setSelectedPrivacy(pTokens[0].tokenId));
      }
    }

    setAllTokens(allTokens);
  }, [internalTokens, pTokens]);

  const handleSearch = (text) => {
    if (text) {
      const searchText = _.toLower(_.trim(text));
      const tokens = _.uniqBy(allTokens)
        .filter(item =>
          _.toLower(item.name).includes(searchText) ||
          _.toLower(item.symbol).includes(searchText)
        );

      const newMenu = generateMenu(tokens, onSelect);
      setMenu(newMenu);
    } else {
      setMenu(generateMenu(allTokens, onSelect));
    }
  };

  const handleClearSearch = () => {
    handleSearch('');
  };

  return (
    <View styles={styles.container}>
      <OptionMenu
        data={menu}
        title="SELECT TOKEN"
        placeholder="Name or Symbol"
        onSearch={handleSearch}
        onClose={handleClearSearch}
        toggleStyle={toggleStyle}
        style={[styles.select, style]}
        icon={(
          <View style={[styles.iconContainer, iconStyle]}>
            <Icon name="chevron-down" size={size} type="material-community" color={COLORS.primary} />
          </View>
        )}
      />
    </View>
  );
};

TokenSelect.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onlyPToken: PropTypes.bool,
  showOriginalSymbol: PropTypes.bool,
  size: PropTypes.number,
  style: PropTypes.object,
  iconStyle: PropTypes.object,
  toggleStyle: PropTypes.object,
};

TokenSelect.defaultProps = {
  onlyPToken: false,
  showOriginalSymbol: false,
  size: 30,
  style: null,
  iconStyle: null,
  toggleStyle: null,
};

export default TokenSelect;
