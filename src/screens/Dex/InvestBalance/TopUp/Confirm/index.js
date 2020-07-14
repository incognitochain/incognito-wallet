import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { View, Text, RoundCornerButton, ScrollView } from '@components/core';
import ExtraInfo from '@screens/DexV2/components/ExtraInfo';
import format from '@utils/format';
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
  deposit,
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
      <Header title="Top up preview" />
      <ScrollView>
        <View style={styles.mainInfo}>
          <Text style={styles.bigText}>Top up</Text>
          <Text style={styles.bigText} numberOfLines={3}>{provide} {coin.symbol}</Text>
        </View>
        <ExtraInfo
          left="Deposit"
          right={`${deposit} ${coin.symbol}`}
          style={mainStyle.info}
        />
        <ExtraInfo style={mainStyle.info} left="To" right="pDEX" />
        <ExtraInfo style={mainStyle.info} left="From" right={account.name || account.AccountName} />
        <Balance style={mainStyle.info} balance={fee} title="Fee" token={feeToken} />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <RoundCornerButton
          style={[styles.button, mainStyle.button]}
          title="Top up"
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
  deposit: PropTypes.string,
  provide: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,

  fee: PropTypes.number.isRequired,
  feeToken: PropTypes.object.isRequired,

  processing: PropTypes.bool.isRequired,

  error: PropTypes.string,
  account: PropTypes.object,
};

Confirm.defaultProps = {
  coin: null,
  deposit: '',
  provide: '',
  error: '',
  account: null,
};

export default compose(
  withLayout_2,
  withData,
  withSuccess,
  withDefaultAccount,
  withDexAccounts,
  withDefaultAccount,
  withConfirm,
)(Confirm);
