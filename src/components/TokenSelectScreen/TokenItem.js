import React from 'react';
import PropTypes from 'prop-types';
import { View, Text } from '@components/core';
import VerifiedText from '@components/VerifiedText/index';
import { useSelector } from 'react-redux';
import { selectedPrivacySelector } from '@src/redux/selectors';
import styles from './style';

const TokenItem = ({ name, id, symbol, verified }) => {
  const token = useSelector(state => selectedPrivacySelector.getPrivacyDataByTokenID(state)(id));
  return (
    <View style={styles.tokenItem}>
      <View style={{ marginTop: 8 }}>
        <VerifiedText text={name} isVerified={verified} style={styles.tokenName} />
      </View>
      <View style={styles.row}>
        <Text style={styles.networkName}>{symbol}</Text>
        <Text style={styles.networkName}>({token.networkName})</Text>
      </View>
    </View>
  );
};

TokenItem.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  symbol: PropTypes.string.isRequired,
  verified: PropTypes.bool,
};

TokenItem.defaultProps = {
  verified: false,
};

export default TokenItem;
