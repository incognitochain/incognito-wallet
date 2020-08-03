import React from 'react';
import { Text, View, Clipboard } from 'react-native';
import PropTypes from 'prop-types';
import { TouchableOpacity, ScrollView, Toast } from '@src/components/core';
import { CONSTANT_CONFIGS, CONSTANT_COMMONS } from '@src/constants';
import formatUtil from '@src/utils/format';
import linkingService from '@src/services/linking';
import { QrCodeAddressDefault } from '@src/components/QrCodeAddress';
import { CopyIcon, OpenUrlIcon } from '@src/components/Icons';
import { ButtonBasic } from '@src/components/Button';
import styleSheet from './styles';

const Hook = (props) => {
  const {
    label,
    valueText,
    valueTextStyle,
    copyable = false,
    openUrl = false,
    disabled,
    canRetryExpiredDeposit = false,
    handleRetryExpiredDeposit = null,
  } = props;

  const handleCopyText = () => {
    Clipboard.setString(valueText);
    Toast.showInfo('Copied');
  };

  const handleOpenUrl = () => linkingService.openUrl(valueText);

  const renderComponent = () => (
    <View style={styleSheet.rowText}>
      <Text
        style={styleSheet.labelText}
        numberOfLines={1}
        ellipsizeMode="middle"
      >
        {`${label}:`}
      </Text>
      <Text
        style={[styleSheet.valueText, valueTextStyle]}
        numberOfLines={1}
        ellipsizeMode="middle"
      >
        {valueText}
      </Text>
      {canRetryExpiredDeposit && (
        <ButtonBasic
          btnStyle={styleSheet.btnRetryDeposit}
          titleStyle={styleSheet.titleRetryDeposit}
          title="Retry"
          onPress={
            typeof handleRetryExpiredDeposit === 'function' &&
            handleRetryExpiredDeposit
          }
        />
      )}
      {copyable && <CopyIcon />}
      {openUrl && <OpenUrlIcon />}
    </View>
  );

  if (disabled) {
    return null;
  }
  if (copyable) {
    return (
      <TouchableOpacity
        style={styleSheet.rowTextTouchable}
        onPress={handleCopyText}
      >
        {renderComponent()}
      </TouchableOpacity>
    );
  }
  if (openUrl) {
    return (
      <TouchableOpacity
        style={styleSheet.rowTextTouchable}
        onPress={handleOpenUrl}
      >
        {renderComponent()}
      </TouchableOpacity>
    );
  }
  return renderComponent();
};

const TxHistoryDetail = (props) => {
  const { data, onRetryExpiredDeposit } = props;
  const { typeText, statusText, statusColor, statusNumber, history } = data;
  const isUseTokenFee = !!history?.feePToken;
  const fee = isUseTokenFee ? history?.feePToken : history?.fee;
  const feeUnit = isUseTokenFee
    ? history?.symbol
    : CONSTANT_COMMONS.CRYPTO_SYMBOL.PRV;
  const formatFee =
    fee &&
    formatUtil.amountFull(
      fee,
      isUseTokenFee
        ? history?.pDecimals
        : CONSTANT_COMMONS.DECIMALS.MAIN_CRYPTO_CURRENCY,
    );
  const amountStr =
    (history.amount &&
      formatUtil.amount(history.amount, history.pDecimals, true)) ||
    formatUtil.number(history.requestedAmount);

  const historyFactories = [
    {
      label: typeText,
      valueText: `${amountStr} ${history.symbol}`,
      disabled: !history.amount,
    },
    {
      label: 'Fee',
      valueText: `${formatFee} ${feeUnit}`,
      disabled: !fee,
    },
    {
      label: 'Status',
      valueText: `${statusText} ${
        !!statusNumber || statusNumber === 0 ? `[${statusNumber}]` : ''
      }`,
      valueTextStyle: { color: statusColor },
      disabled: !statusText,
      canRetryExpiredDeposit: history?.canRetryExpiredDeposit,
      handleRetryExpiredDeposit: onRetryExpiredDeposit,
    },
    {
      label: 'ID',
      valueText: `#${history?.id}`,
      disabled: !history?.id,
    },
    {
      label: 'Time',
      valueText: formatUtil.formatDateTime(history?.time),
      disabled: !history?.time,
    },
    {
      label: 'Expired at',
      valueText: formatUtil.formatDateTime(history?.expiredAt),
      disabled: !history?.expiredAt,
    },
    {
      label: 'TxID',
      valueText: `${CONSTANT_CONFIGS.EXPLORER_CONSTANT_CHAIN_URL}/tx/${history.incognitoTxID}`,
      openUrl: true,
      disabled: !history?.incognitoTxID,
    },
    {
      label: 'Inchain TxID',
      valueText: history?.inchainTx,
      openUrl: true,
      disabled: !history?.inchainTx,
    },
    {
      label: 'Outchain TxID',
      valueText: history?.outchainTx,
      openUrl: true,
      disabled: !history?.outchainTx,
    },
    {
      label: 'To address',
      valueText: history?.toAddress,
      copyable: true,
      disabled: !history?.toAddress,
    },
    {
      label: 'Coin',
      valueText: history.symbol,
      disabled: !history?.symbol,
    },
    {
      label: 'Contract',
      valueText: history.erc20TokenAddress,
      copyable: true,
      disabled: !history?.erc20TokenAddress,
    },
  ];
  return (
    <View style={styleSheet.container}>
      <ScrollView>
        {historyFactories.map((hook, index) => (
          <Hook key={index} {...hook} />
        ))}
        {!!history?.depositAddress && (
          <QrCodeAddressDefault
            label="Shielding address"
            address={history?.depositAddress}
          />
        )}
      </ScrollView>
    </View>
  );
};

TxHistoryDetail.propTypes = {
  data: PropTypes.shape({
    typeText: PropTypes.string,
    balanceDirection: PropTypes.string,
    statusText: PropTypes.string,
    balanceColor: PropTypes.string,
    statusColor: PropTypes.string,
    statusNumber: PropTypes.string,
    history: PropTypes.object,
  }).isRequired,
  onRetryExpiredDeposit: PropTypes.func.isRequired,
};

export default TxHistoryDetail;
