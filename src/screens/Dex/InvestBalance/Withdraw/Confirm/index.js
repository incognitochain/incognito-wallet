import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { View, Text, RoundCornerButton, ScrollView } from '@components/core';
import ExtraInfo from '@screens/DexV2/components/ExtraInfo';
import { withLayout_2 } from '@components/Layout';
import Header from '@components/Header/index';
import Loading from '@screens/DexV2/components/Loading';
import withDefaultAccount from '@components/Hoc/withDefaultAccount';
import mainStyle from '@screens/Dex/style';
import withDexAccounts from '@screens/Dex/dexAccount.enhance';
import Balance from '@screens/DexV2/components/Balance';
import withSuccess from './success.enhance';
import withConfirm from './confirm.enhance';
import withData from './data.enhance';
import styles from './style';

const Confirm = ({
  coin,
  provide,
  fee,
  feeToken,
  onConfirm,
  processing,
  error,
  account,
}) => {
  return (
    <View>
      <Header title="Withdraw preview" />
      <ScrollView>
        <View style={styles.mainInfo}>
          <Text style={styles.bigText}>Withdraw</Text>
          <Text style={styles.bigText} numberOfLines={3}>{provide} {coin.symbol}</Text>
        </View>
        <ExtraInfo style={mainStyle.info} left="To" right={account.name || account.AccountName} />
        <Balance style={mainStyle.info} balance={fee} title="Fee" token={feeToken} />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <RoundCornerButton
          style={[styles.button, mainStyle.button]}
          title="Confirm"
          onPress={onConfirm}
          disabled={!!error}
        />
      </ScrollView>
      <Loading open={processing} />
    </View>
  );
};

Confirm.propTypes = {
  coin: PropTypes.object,
  provide: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,

  fee: PropTypes.number.isRequired,
  feeToken: PropTypes.object.isRequired,

  processing: PropTypes.bool.isRequired,

  error: PropTypes.string,
  account: PropTypes.object.isRequired,
};

Confirm.defaultProps = {
  coin: null,
  provide: '',
  error: '',
};

export default compose(
  withLayout_2,
  withData,
  withDefaultAccount,
  withDexAccounts,
  withDefaultAccount,
  withSuccess,
  withConfirm,
)(Confirm);
