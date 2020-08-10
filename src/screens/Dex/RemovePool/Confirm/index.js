import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { View, Text, RoundCornerButton, ScrollView } from '@components/core';
import ExtraInfo from '@screens/DexV2/components/ExtraInfo';
import { withLayout_2 } from '@components/Layout';
import Header from '@components/Header/index';
import Loading from '@screens/DexV2/components/Loading';
import withDefaultAccount from '@components/Hoc/withDefaultAccount';
import mainStyles from '@screens/Dex/style';
import Balance from '@screens/DexV2/components/Balance';
import accountService from '@services/wallet/accountService';
import withSuccess from './success.enhance';
import withConfirm from './confirm.enhance';
import withData from './data.enhance';
import styles from './style';
import withShareAccount from './shareAccount.enhance';

const Confirm = ({
  pair,
  topText,
  bottomText,
  fee,
  feeToken,
  onConfirm,
  processing,
  error,
  account,
}) => {
  const { token1, token2 } = pair;
  return (
    <View>
      <Header title="Order preview" />
      <ScrollView>
        <View style={styles.mainInfo}>
          <Text style={styles.bigText}>Remove</Text>
          <Text style={styles.bigText} numberOfLines={3}>{topText} {token1.symbol} + {bottomText} {token2.symbol}</Text>
        </View>
        <ExtraInfo
          left="To"
          right={accountService.getAccountName(account)}
          style={{ ...styles.extra }}
        />
        <Balance
          token={feeToken}
          balance={fee}
          title="Fee"
          style={styles.extra}
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <RoundCornerButton
          style={[styles.button, mainStyles.button]}
          title="Remove liquidity"
          onPress={onConfirm}
          disabled={!!error}
        />
      </ScrollView>
      <Loading open={processing} />
    </View>
  );
};

Confirm.propTypes = {
  pair: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,

  fee: PropTypes.number.isRequired,
  feeToken: PropTypes.object.isRequired,

  processing: PropTypes.bool.isRequired,
  topText: PropTypes.string,
  bottomText: PropTypes.string,

  error: PropTypes.string,
  account: PropTypes.object,
};

Confirm.defaultProps = {
  topText: '',
  bottomText: '',
  error: '',
  account: '',
};

export default compose(
  withLayout_2,
  withData,
  withSuccess,
  withDefaultAccount,
  withShareAccount,
  withConfirm,
)(Confirm);
