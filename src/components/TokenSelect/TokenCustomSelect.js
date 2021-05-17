import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { View } from '@components/core';
import OptionMenu from '@components/OptionMenu';
import { selectedPrivacySelector } from '@src/redux/selectors';
import { Icon } from 'react-native-elements';
import CryptoIcon from '@components/CryptoIcon';
import VerifiedText from '@components/VerifiedText/index';
import TokenNetworkName from '@components/TokenNetworkName/index';
import COLORS from '@src/styles/colors';
import styles from './style';

const generateMenu = (tokens, onSelect) => {
  const newMenu = [];

  if (!tokens) {
    return newMenu;
  }

  tokens
    .slice(0, tokens.length)
    .forEach(token => {
      newMenu.push({
        id: token.TokenID,
        icon: (
          <View style={{ marginTop: 8 }}>
            <CryptoIcon tokenId={token.TokenID} size={30} />
          </View>
        ),
        label: <VerifiedText text={token?.PSymbol || token?.Symbol || ''} isVerified={token.Verified} />,
        desc: <TokenNetworkName id={token.TokenID} />,
        handlePress: onSelect,
      });
    });

  return newMenu;
};

const TokenCustomSelect = ({ onSelect, size, style, iconStyle, customListPToken, toggleStyle }) => {
  const [menu, setMenu] = React.useState([]);
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);

  const isTokenSelectable = (tokenId) => {
    if (!tokenId) {
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
    if (!isTokenSelectable(selectedPrivacy?.tokenId) && customListPToken && customListPToken.length > 0) {
      onSelect(customListPToken[0].id);
    }
    setMenu(generateMenu(customListPToken, ''));
  }, [selectedPrivacy, customListPToken]);

  const handleSearch = (text) => {
    if (text) {
      let tokens = customListPToken.filter(item =>
        item?.Name?.toLowerCase().includes(text.toLowerCase()) ||
        item?.Symbol?.toLowerCase().includes(text.toLowerCase()));
      const newMenu = generateMenu(tokens, selectToken);
      setMenu(newMenu);
    } else {
      setMenu(generateMenu(customListPToken, selectToken));
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
        isDropDown
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

TokenCustomSelect.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onlyPToken: PropTypes.bool,
  showOriginalSymbol: PropTypes.bool,
  size: PropTypes.number,
  style: PropTypes.object,
  iconStyle: PropTypes.object,
  toggleStyle: PropTypes.object,
  customListPToken: PropTypes.object,
};

TokenCustomSelect.defaultProps = {
  onlyPToken: false,
  showOriginalSymbol: false,
  size: 30,
  style: null,
  iconStyle: null,
  toggleStyle: null,
  customListPToken: []
};

export default TokenCustomSelect;
