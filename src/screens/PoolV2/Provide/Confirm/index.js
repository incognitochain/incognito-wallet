import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { View, Text, RoundCornerButton, ScrollViewBorder } from '@components/core';
import ExtraInfo from '@screens/DexV2/components/ExtraInfo';
import format from '@utils/format';
import { withLayout_2 } from '@components/Layout';
import Header from '@components/Header/index';
import Loading from '@screens/DexV2/components/Loading';
import withDefaultAccount from '@components/Hoc/withDefaultAccount';
import mainStyles from '@screens/PoolV2/style';
import { RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { colorsSelector } from '@src/theme';
import { selectedPrivacySelector } from '@src/redux/selectors';
import { PRV_ID } from '@src/screens/DexV2/constants';
import { Row } from '@src/components';
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
  providing,
  error,
  disable,
  onRefresh,
  refreshing,
  unlockTimeFormat,
}) => {
  const colors = useSelector(colorsSelector);
  const getPrivacyDataByTokenID = useSelector(
    selectedPrivacySelector.getPrivacyDataByTokenID,
  );
  const renderRefreshControl = () => (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );

  const { network } = getPrivacyDataByTokenID(coin?.id);
  return (
    <>
      <Header title="Confirmation" />
      <ScrollViewBorder refreshControl={renderRefreshControl()}>
        <View style={styles.mainInfo}>
          <Text style={styles.label}>Provide</Text>
          <Row centerVertical>
            <Text
              style={[styles.bigText, { color: colors.white }]}
              numberOfLines={3}
            >
              {provide} {coin.symbol}
            </Text>
            {coin?.id !== PRV_ID && (
              <View style={styles.networkBox}>
                <Text style={styles.networkText}>{network}</Text>
              </View>
            )}
          </Row>
        </View>
        {unlockTimeFormat ? (
          <>
            <ExtraInfo
              left="Term ends"
              right={`${unlockTimeFormat}`}
              style={styles.extra}
              rightStyle={styles.extraRight}
            />
          </>
        ) : null}
        <ExtraInfo
          left="Deposit"
          right={`${deposit} ${coin.symbol}`}
          style={styles.extra}
          rightStyle={styles.extraRight}
        />
        <ExtraInfo
          token={feeToken}
          left="Fee"
          right={`${format.amount(fee, feeToken.pDecimals)} ${feeToken.symbol}`}
          style={styles.extra}
          rightStyle={styles.extraRight}
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <RoundCornerButton
          style={[styles.button, mainStyles.button]}
          title="Confirm"
          onPress={onConfirm}
          disabled={!!error || disable}
        />
      </ScrollViewBorder>
      <Loading open={providing} />
    </>
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
  disable: PropTypes.bool.isRequired,

  onRefresh: PropTypes.func.isRequired,
  refreshing: PropTypes.bool,
  unlockTimeFormat: PropTypes.string,
};

Confirm.defaultProps = {
  coin: null,
  deposit: '',
  provide: '',
  error: '',
  refreshing: false,
  unlockTimeFormat: ''
};

export default compose(
  withLayout_2,
  withData,
  withSuccess,
  withDefaultAccount,
  withConfirm,
)(Confirm);
