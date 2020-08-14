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
import withDexAccounts from '@screens/Dex/dexAccount.enhance';
import SharePercent from '@screens/Dex/SharePercent';
import withSuccess from './success.enhance';
import withConfirm from './confirm.enhance';
import withData from './data.enhance';
import styles from './style';

const Confirm = ({
  pair,
  topText,
  bottomText,
  value,
  fee,
  feeToken,
  onConfirm,
  processing,
  error,
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
          right="pDEX"
          style={{ ...styles.extra }}
        />
        <SharePercent
          share={value}
          totalShare={pair.totalShare}
          style={styles.extra}
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
  coin: PropTypes.object,
  deposit: PropTypes.string,
  provide: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,

  fee: PropTypes.number.isRequired,
  feeToken: PropTypes.object.isRequired,

  providing: PropTypes.bool.isRequired,

  error: PropTypes.string,
};

Confirm.defaultProps = {
  coin: null,
  deposit: '',
  provide: '',
  error: '',
};

export default compose(
  withLayout_2,
  withData,
  withSuccess,
  withDefaultAccount,
  withDexAccounts,
  withConfirm,
)(Confirm);
