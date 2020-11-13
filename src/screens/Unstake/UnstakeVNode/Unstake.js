import React from 'react';
import PropTypes from 'prop-types';
import { RoundCornerButton, Text, View } from '@components/core';
import { MESSAGES } from '@screens/Dex/constants';
import Header from '@src/components/Header';
import { withLayout_2 } from '@components/Layout';
import styles from '../styles';

const Unstake = ({ device, fee, isUnstaking, balance, onUnstake }) => {
  const name = device.Name;
  const isNotEnoughBalance = fee > balance;
  return (
    <View style={styles.container}>
      <Header title="Unstake" />
      <Text style={styles.title}>Node {name}</Text>
      <View>
        <Text style={[styles.desc, styles.firstLine]}>
          The unstaking process will complete the next time your Node is selected to work. This may take up to 21 days.
        </Text>
        <Text style={[styles.desc, styles.firstLine]}>
          An unstaked Node will need to be staked again before it can be selected to work and earn.
        </Text>
        {!isUnstaking && <Text style={styles.desc}>Are you sure you want to unstake this Node?</Text>}
        <RoundCornerButton
          disabled={isNotEnoughBalance || isUnstaking}
          style={styles.button}
          title={isUnstaking ? 'Unstaking in process' : 'Unstake'}
          isAsync={isUnstaking}
          isLoading={isUnstaking}
          onPress={onUnstake}
        />
        {isNotEnoughBalance && <Text style={styles.error}>{MESSAGES.NOT_ENOUGH_NETWORK_FEE_ADD}</Text>}
      </View>
    </View>
  );
};

Unstake.propTypes = {
  device: PropTypes.object.isRequired,
  fee: PropTypes.number.isRequired,
  isUnstaking: PropTypes.bool.isRequired,
  balance: PropTypes.number.isRequired,
  onUnstake: PropTypes.func.isRequired,
};

Unstake.defaultProps = {};

export default withLayout_2(Unstake);
