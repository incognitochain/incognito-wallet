import React from 'react';
import PropTypes from 'prop-types';
import { Button, Text, View } from '@components/core';
import LoadingTx from '@components/LoadingTx/LoadingTx';
import Header from '@src/components/Header';
import theme from '@src/styles/theme';
import styles from '../styles';

const Unstake = ({ device, isUnstaking, onUnstake }) => {
  const name = device.Name;
  return (
    <View style={styles.container}>
      <Header title="Unstake" />
      <View>
        <Text style={[styles.title, theme.MARGIN.marginTopAvg, theme.text.mediumTextBold]}>Node {name}</Text>
      </View>
      <View style={styles.buy}>
        <Text style={[styles.desc, styles.firstLine]}>{isUnstaking ? 'Unstaking may take up to 21 days. This Node will unstake the next time it is selected to earn.' : 'The unstaking process will complete the next time your Node is selected to work. This may take up to 21 days'}</Text>
        <Text style={styles.desc}>{isUnstaking ? '' : 'Are you sure you want to unstake this Node?'}</Text>
        <Button style={[styles.button, theme.BUTTON.BLACK_TYPE]} title="Unstake" onPress={onUnstake} />
      </View>
      {isUnstaking && <LoadingTx />}
    </View>
  );
};

Unstake.propTypes = {
  device: PropTypes.object.isRequired,
  isUnstaking: PropTypes.bool.isRequired,
  onUnstake: PropTypes.func.isRequired,
};

Unstake.defaultProps = {};

export default Unstake;
