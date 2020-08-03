import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, BaseTextInput, RoundCornerButton } from '@components/core';
import mainStyle from '@screens/PoolV2/style';
import { compose } from 'recompose';
import { withLayout_2 } from '@components/Layout/index';
import { Header, Row } from '@src/components/';
import { COINS } from '@src/constants';
import Loading from '@screens/DexV2/components/Loading';
import withDefaultAccount from '@components/Hoc/withDefaultAccount';
import withConfirm from './confirm.enhance';
import withRewards from './reward.enhance';
import withSuccess from './success.enhance';
import styles from './style';

const Provide = ({
  displayFullTotalRewards,
  onConfirm,
  error,
  withdrawing,
}) => {
  const coin = COINS.PRV;
  return (
    <View style={mainStyle.flex}>
      <Header title="Withdraw rewards" />
      <View style={mainStyle.coinContainer}>
        <Row center spaceBetween style={mainStyle.inputContainer}>
          <BaseTextInput
            style={mainStyle.input}
            placeholder="0"
            editable={false}
            value={displayFullTotalRewards}
            keyboardType="decimal-pad"
          />
          <Text style={mainStyle.symbol}>{coin.symbol}</Text>
        </Row>
        <Text style={mainStyle.error} numberOfLines={2}>{error}</Text>
        <RoundCornerButton
          title="Withdraw rewards"
          style={[mainStyle.button, styles.button]}
          disabled={!!error}
          onPress={onConfirm}
        />
        <Text style={mainStyle.coinExtra}>
          Your rewards counter will restart from zero.
          Please wait a couple of minutes for your main
          balance to update.
        </Text>
      </View>
      <Loading open={withdrawing} />
    </View>
  );
};

Provide.propTypes = {
  displayFullTotalRewards: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  withdrawing: PropTypes.bool,
  error: PropTypes.string,
};

Provide.defaultProps = {
  error: '',
  withdrawing: false,
};

export default compose(
  withLayout_2,
  withDefaultAccount,
  withRewards,
  withSuccess,
  withConfirm,
)(Provide);

