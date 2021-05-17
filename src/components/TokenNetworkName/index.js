import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Text } from '@components/core';
import {selectedPrivacySelector} from '@src/redux/selectors';
import styles from './style';

const TokenNetworkName = ({ id }) => {
  const data = useSelector(state => selectedPrivacySelector.getPrivacyDataByTokenID(state)(id));

  return (
    <Text style={styles.networkName}>{data.networkName}</Text>
  );
};

TokenNetworkName.propTypes = {
  id: PropTypes.string.isRequired,
};

export default TokenNetworkName;
