import { LoadingContainer, ScrollView } from '@src/components/core';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '@src/components/Header';
import { CONSTANT_CONFIGS } from '@src/constants';
import PropTypes from 'prop-types';
import { Hook } from '@screens/Wallet/features/TxHistoryDetail/TxHistoryDetail';
import formatUtil from '@src/utils/format';
import LinkingService from '@src/services/linking';
import HuntQRCode from '@components/HuntQRCode/HuntQRCode';
import withTxHistoryReceive from './TxHistoryReceive.enhance';

const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const TxHistoryReceive = (props) => {
  const { history, statusMessage, statusColor, typeText, loading } = props;
  const amountStr =
    history?.amount &&
    formatUtil.amount(history?.amount, history?.pDecimals, true);

  const historyFactories = [
    {
      label: 'ID',
      valueText: `#${history?.id}`,
      disabled: !history?.id,
      copyable: true,
      openUrl: true,
      handleOpenLink: () =>
        LinkingService.openUrl(
          `${CONSTANT_CONFIGS.EXPLORER_CONSTANT_CHAIN_URL}/tx/${history?.incognitoTxID}`,
        ),
    },
    {
      label: typeText,
      valueText: `${amountStr} ${history?.symbol}`,
      disabled: !history?.amount,
    },
    {
      label: 'Status',
      valueText: statusMessage,
      valueTextStyle: { color: statusColor },
      disabled: !statusMessage,
      message: history?.statusDetail,
    },
    {
      label: 'Time',
      valueText: history?.time,
      disabled: !history?.time,
    },
    {
      label: 'Type',
      valueText: history?.typeOf,
      disabled: !history?.typeOf,
    },
  ];
  return (
    <View style={styled.container}>
      <Header title="Transaction details" />
      {loading ? (
        <LoadingContainer />
      ) : (
        <ScrollView>
          {historyFactories.map((hook, index) => (
            <Hook key={index} {...hook} />
          ))}
          <HuntQRCode code={history?.type} />
        </ScrollView>
      )}
    </View>
  );
};

TxHistoryReceive.propTypes = {
  history: PropTypes.any.isRequired,
  statusMessage: PropTypes.string.isRequired,
  statusColor: PropTypes.string.isRequired,
  typeText: PropTypes.string.isRequired,
  loading: PropTypes.string.isRequired,
};

export default withTxHistoryReceive(React.memo(TxHistoryReceive));
