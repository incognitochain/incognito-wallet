import React, { Component } from 'react';
import {View, Text, Image} from 'react-native';
import PropTypes from 'prop-types';
import { TouchableOpacity, Container, ScrollView, Button } from '@src/components/core';
import { CONSTANT_CONFIGS, CONSTANT_COMMONS } from '@src/constants';
import formatUtil from '@src/utils/format';
import linkingService from '@src/services/linking';
import external from '@src/assets/images/icons/external.png';
import CopiableText from '@components/CopiableText/index';
import {Icon} from 'react-native-elements';
import QrCodeAddress from '@src/components/QrCodeAddress';
import styleSheet from './styles';

export default class TxHistoryDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  renderText = ({ text, style, textProps, copyable, label }) => copyable ? (
    <CopiableText
      text={text}
      style={[styleSheet.row]}
      copiedMessage={`${label} was copied.`}
    >
      <Text numberOfLines={1} ellipsizeMode="middle" style={style}>
        {text}
      </Text>
      <View style={styleSheet.copyBlock}>
        <Icon name="copy" type="font-awesome" size={18} />
      </View>
    </CopiableText>
  )
    : (
      <Text style={style} numberOfLines={1} ellipsizeMode="tail" {...textProps}>
        {text}
      </Text>
    );

  renderRow = ({ label, valueText, valueComponent, valueTextStyle, valueTextProps, copyable }) => {
    return (
      <View style={styleSheet.rowText}>
        {this.renderText({ text: `${label}:`, style: styleSheet.labelText })}
        {valueComponent ? valueComponent : this.renderText({ text: valueText, style: [styleSheet.valueText, valueTextStyle,], textProps: valueTextProps, copyable, label })}
      </View>
    );
  };

  renderTxId = (txLink) => {
    return (
      <TouchableOpacity style={styleSheet.txButton} onPress={() => { linkingService.openUrl(txLink); }}>
        {this.renderText({ text: txLink, style: [styleSheet.valueText, { paddingRight: 20 }], textProps: { ellipsizeMode: 'middle' } })}
        <Image
          source={external}
          resizeMode="contain"
          resizeMethod="resize"
          style={{position: 'absolute', top: 9, right: 0, width: 14, height: 14 }}
        />
      </TouchableOpacity>
    );
  }

  handleRetryExpiredDeposit = ({ id, decentralized, walletAddress, currencyType, userPaymentAddress, privacyTokenAddress, erc20TokenAddress, type }) => {
    const { onRetryExpiredDeposit } = this.props;

    return onRetryExpiredDeposit({ id, decentralized, walletAddress, currencyType, userPaymentAddress, privacyTokenAddress, erc20TokenAddress, type });
  }

  renderStatusValue = (statusText, statusColor, statusNumber, canRetryExpiredDeposit, history) => {
    const text = (
      <Text style={[styleSheet.statusText, { color: statusColor }]}>{`${statusText} ${(!!statusNumber || statusNumber === 0) ? `[${statusNumber}]` : ''}`}</Text>
    );

    return (
      <View style={styleSheet.statusValueContainer}>
        {text}
        { canRetryExpiredDeposit && <Button style={styleSheet.statusRetryBtn} title='Retry' onPress={() => this.handleRetryExpiredDeposit(history)} /> }
      </View>
    );
  }

  renderQrCode = (data) => {
    return (
      <QrCodeAddress data={data} />
    );
  }

  render() {
    const { data } = this.props;
    const { typeText, balanceDirection, statusText, balanceColor, statusColor, statusNumber, history } = data;
    const isUseTokenFee = !!history?.feePToken;
    const fee = isUseTokenFee ? history?.feePToken : history?.fee;
    const feeUnit = isUseTokenFee ? history?.symbol : CONSTANT_COMMONS.CRYPTO_SYMBOL.PRV;
    const formatFee = fee && formatUtil.amountFull(fee, isUseTokenFee ? history?.pDecimals : CONSTANT_COMMONS.DECIMALS.MAIN_CRYPTO_CURRENCY);
    const amountStr = (history.amount && formatUtil.amount(history.amount, history.pDecimals)) || formatUtil.number(history.requestedAmount);
    const canRetryExpiredDeposit = history?.canRetryExpiredDeposit;

    return (
      <ScrollView>
        <Container style={styleSheet.container}>
          {!! history.amount && this.renderRow(
            {
              label: typeText,
              valueText: `${balanceDirection} ${amountStr} ${history.symbol}`,
              valueTextStyle: { color: balanceColor }
            })
          }
          {!!fee && this.renderRow({ label: 'Fee', valueText: `${formatFee} ${feeUnit}` })}
          {!!statusText && this.renderRow({ label: 'Status', valueComponent: this.renderStatusValue(statusText, statusColor, statusNumber, canRetryExpiredDeposit, history) })}
          {!!history?.id && this.renderRow({ label: 'ID', valueText: `#${history?.id}` }) }
          {!!history?.time && this.renderRow({ label: 'Time', valueText: formatUtil.formatDateTime(history?.time) })}
          {!!history?.expiredAt && this.renderRow({ label: 'Expired at', valueText: formatUtil.formatDateTime(history?.expiredAt) })}
          {!!history?.incognitoTxID && this.renderRow({ label: 'TxID', valueComponent: this.renderTxId(`${CONSTANT_CONFIGS.EXPLORER_CONSTANT_CHAIN_URL}/tx/${history.incognitoTxID}`) })}
          {!!history?.inchainTx && this.renderRow({ label: 'Inchain TxID', valueComponent: this.renderTxId(history?.inchainTx) })}
          {!!history?.outchainTx && this.renderRow({ label: 'Outchain TxID', valueComponent: this.renderTxId(history?.outchainTx) })}
          {!!history?.toAddress
            && this.renderRow({
              label: 'To address',
              ...history?.toAddress instanceof Array ? {
                valueComponent: (
                  <View style={styleSheet.multipleAddress}>
                    {
                      history?.toAddress?.map(address => this.renderText({ text: address, style: [styleSheet.valueText], copyable: true, label: address }))
                    }
                  </View>
                )
              } : {},
              ...typeof history?.toAddress === 'string' ? { valueText: history?.toAddress } : {},
              valueTextProps: { ellipsizeMode: 'middle' },
              copyable: true
            })
          }
          {!!history?.depositAddress && (
            <View style={styleSheet.depositAddressContainer}>
              <Text>Deposit address</Text>
              {this.renderQrCode(history?.depositAddress)}
            </View>
          )}
        </Container>
      </ScrollView>
    );
  }
}

TxHistoryDetail.propTypes = {
  data: PropTypes.shape({
    typeText: PropTypes.string,
    balanceDirection: PropTypes.string,
    statusText: PropTypes.string,
    balanceColor: PropTypes.string,
    statusColor: PropTypes.string,
    statusNumber: PropTypes.string,
    history: PropTypes.object
  }).isRequired,
  onRetryExpiredDeposit: PropTypes.func.isRequired
};
