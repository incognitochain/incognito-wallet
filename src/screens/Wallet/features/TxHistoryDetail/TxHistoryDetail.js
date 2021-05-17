import React from 'react';
import {
  Text,
  View,
  Clipboard,
  Dimensions,
  Linking,
  ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';
import {
  TouchableOpacity,
  ScrollView,
  Toast,
  RefreshControl,
} from '@src/components/core';
import { CONSTANT_COMMONS, CONSTANT_CONFIGS, CONSTANT_KEYS } from '@src/constants';
import formatUtil from '@src/utils/format';
import linkingService from '@src/services/linking';
import { QrCodeAddressDefault } from '@src/components/QrCodeAddress';
import { CopyIcon, OpenUrlIcon } from '@src/components/Icons';
import {
  BtnRetry,
  BtnChevron,
  ButtonBasic,
  BtnResume,
} from '@src/components/Button';
import { useSelector } from 'react-redux';
import { selectedPrivacySelector } from '@src/redux/selectors';
import HTML from 'react-native-render-html';
import { devSelector } from '@src/screens/Dev';
import includes from 'lodash/includes';
import { isEmpty } from 'lodash';
import styled from './styles';
import { getFeeFromTxHistory } from './TxHistoryDetail.utils';

export const Hook = (props) => {
  const {
    label,
    valueText,
    valueTextStyle,
    copyable = false,
    openUrl = false,
    disabled,
    canRetryExpiredDeposit = false,
    handleRetryExpiredDeposit = null,
    message = '',
    showReload,
    handleRetryHistoryStatus,
    fetchingHistory,
    handleOpenLink = null,
    moreLines = false,
    flexExtra = 5,
    notShowRetry
  } = props;
  const shouldShowMsg = !!message;
  const [state, setState] = React.useState({
    toggleMessage: false,
  });
  const { toggleMessage } = state;

  const handleCopyText = () => {
    Clipboard.setString(valueText);
    Toast.showInfo('Copied');
  };

  const handleToggleMsg = () => {
    setState({ ...state, toggleMessage: !toggleMessage });
  };

  const handleOpenUrl = () =>
    typeof handleOpenLink === 'function'
      ? handleOpenLink()
      : linkingService.openUrl(valueText);

  const renderComponent = () => (
    <>
      <View style={[styled.rowText, !moreLines && { height: 30 }]}>
        <Text
          style={[styled.labelText]}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {`${label}:`}
        </Text>
        <View style={[styled.extra, { flex: flexExtra }]}>
          <Text
            style={[
              styled.valueText,
              shouldShowMsg || showReload ? {} : { flex: 1 },
              valueTextStyle,
            ]}
            numberOfLines={moreLines ? 0 : 1}
            ellipsizeMode="middle"
          >
            {valueText}
          </Text>
          {canRetryExpiredDeposit && (
            <BtnResume
              style={styled.btnResume}
              onPress={
                typeof handleRetryExpiredDeposit === 'function' &&
                handleRetryExpiredDeposit
              }
            />
          )}
          {showReload &&
            !canRetryExpiredDeposit &&
            notShowRetry &&
            (fetchingHistory ? (
              <View style={{ marginLeft: 10 }}>
                <ActivityIndicator size="small" />
              </View>
            ) : (
              <BtnRetry
                style={styled.btnRetry}
                onPress={
                  typeof handleRetryHistoryStatus === 'function' &&
                  handleRetryHistoryStatus
                }
              />
            ))}
          {shouldShowMsg && (
            <BtnChevron
              style={styled.btnChevron}
              size={18}
              toggle={toggleMessage}
              onPress={handleToggleMsg}
            />
          )}
          {copyable && (
            <TouchableOpacity
              style={styled.rowTextTouchable}
              onPress={handleCopyText}
            >
              <CopyIcon style={styled.copyIcon} />
            </TouchableOpacity>
          )}

          {openUrl && (
            <TouchableOpacity
              style={styled.rowTextTouchable}
              onPress={handleOpenUrl}
            >
              <OpenUrlIcon style={styled.linkingIcon} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {toggleMessage && (
        <HTML
          html={`<p>${message}</p>`}
          imagesMaxWidth={Dimensions.get('window').width}
          onLinkPress={(e, href) => {
            Linking.openURL(href);
          }}
          tagsStyles={{
            a: { ...styled?.p, ...styled?.a },
            p: styled?.p,
          }}
        />
      )}
    </>
  );

  if (disabled) {
    return null;
  }
  return renderComponent();
};

const TxHistoryDetail = (props) => {
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const dev = useSelector(devSelector);
  const keySave = CONSTANT_KEYS.DEV_TEST_TOGGLE_HISTORY_DETAIL;
  const toggleTxHistoryDetail = global.isDebug() && dev[keySave];
  const {
    data,
    onRetryExpiredDeposit,
    onRetryHistoryStatus,
    showReload,
    fetchingHistory,
    onPullRefresh,
    isRefresh,
    historyId,
    minShield
  } = props;
  const toggleHistoryDetail = dev[CONSTANT_KEYS.DEV_TEST_TOGGLE_HISTORY_DETAIL];
  const { typeText, statusColor, statusMessage, history } = data;
  const { fromApi } = history;
  const { fee, formatFee, feeUnit } = getFeeFromTxHistory(history);
  const amount = Number(history?.amount) || 0;
  const amountStr =
    (amount &&
      formatUtil.amount(
        amount,
        history?.pDecimals || selectedPrivacy?.pDecimals,
        true,
      )) ||
    formatUtil.number(history?.requestedAmount);
  const isInvalidAmount =  history.isShieldTx === true && history.statusCode === 17 && (history.currencyType !== 1 && history.currencyType !== 3);
  const isBTCInvalidAmount = history.isShieldTx === true && history.statusCode === 17 && history.currencyType === 2 && history.symbol === 'BTC';

  const receiveFund = React.useMemo(() => {
    return (
      `${formatUtil.convertDecimalsHumanAmount({
        number: history?.receivedAmount,
        pDecimals: history?.pDecimals || selectedPrivacy?.pDecimals,
        decimals: history?.decimals || selectedPrivacy?.decimals,
      })} ${history.symbol}`
    );
  }, [history]);

  const shieldingFee = React.useMemo(() => {
    return (
      `${formatUtil.convertDecimalsHumanAmount({
        number: history?.shieldFee,
        pDecimals: history?.pDecimals || selectedPrivacy?.pDecimals,
        decimals: history?.decimals || selectedPrivacy?.decimals,
      })} ${history.symbol}`
    );
  }, [history]);

  const historyShieldDecentralizeFactories = history?.isShieldAddressDecentralized ? [
    {
      label: 'Received funds',
      valueText: receiveFund,
    },
    {
      label: 'Shielding fees',
      valueText: shieldingFee,
    },
    {
      label: 'Received TxID',
      valueText: history?.receivedTx,
      openUrl: true,
      disabled: !history?.receivedTx,
    }
  ] : [];

  const historyFactories = [
    {
      label: 'ID',
      disabled: !history?.id,
      copyable: true,
      openUrl: !!history?.isIncognitoTx,
      valueText: `#${history?.id}`,
      handleOpenLink: () =>
        history?.isIncognitoTx
          ? linkingService.openUrl(
            `${CONSTANT_CONFIGS.EXPLORER_CONSTANT_CHAIN_URL}/tx/${history?.id}`,
          )
          : null,
    },
    {
      label: typeText,
      valueText: `${amountStr} ${history.symbol}`,
      disabled: !amount,
    },
    ...historyShieldDecentralizeFactories,
    {
      label: 'Fee',
      valueText: `${formatFee} ${feeUnit}`,
      disabled: !fee || history?.isShieldAddressDecentralized === 1,
    },
    {
      label: 'Status',
      valueText: statusMessage,
      valueTextStyle: { color: statusColor },
      disabled: !toggleHistoryDetail && !statusMessage,
      canRetryExpiredDeposit: history?.canRetryExpiredDeposit || isBTCInvalidAmount,
      handleRetryExpiredDeposit: onRetryExpiredDeposit,
      message: history?.statusDetail,
      handleRetryHistoryStatus: onRetryHistoryStatus,
      showReload,
      fetchingHistory,
      notShowRetry: !(!history.isShieldTx && (history.decentralized && history.statusCode === 15 || history.statusCode === 16 || history.statusCode === 9 || history.statusCode === 10) || (!history.decentralized && history.statusCode === 15)),
    },
    {
      label: 'Time',
      valueText: formatUtil.formatDateTime(history?.time),
      disabled: !history?.time,
    },
    {
      label: 'Expired at',
      valueText: formatUtil.formatDateTime(history?.expiredAt),
      disabled: isEmpty(history?.status) || history?.status.toLowerCase() !== CONSTANT_COMMONS.HISTORY.STATUS_TEXT.PENDING.toLowerCase() || !history?.expiredAt,
    },
    {
      label: 'TxID',
      valueText: `${CONSTANT_CONFIGS.EXPLORER_CONSTANT_CHAIN_URL}/tx/${history.incognitoTxID}`,
      openUrl: true,
      disabled:
        history?.id === history?.incognitoTxID ||
        !history.incognitoTxID ||
        includes(history?.inchainTx, history.incognitoTxID) ||
        (!!history?.isUnshieldTx && selectedPrivacy?.isDecentralized),
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
      label: 'Memo',
      valueText: history?.memo,
      copyable: true,
      moreLines: true,
      disabled: !history?.memo,
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
    {
      label: 'Shield Address',
      valueText: history.depositAddress,
      copyable: false,
      disabled: !history.depositAddress || history.statusText !== 'EXPIRED' || history.isShieldTx === false,
    },
  ];
  const onCopyData = () => {
    Clipboard.setString(JSON.stringify(data));
    Toast.showSuccess('Copied');
  };

  const handleRefresh = () => {
    if (typeof onPullRefresh === 'function') {
      const currencyType = data?.history?.currencyType;
      const decentralized = data?.history?.decentralized;
      const isShieldAddressDecentralized = data?.history?.isShieldAddressDecentralized;
      onPullRefresh({ historyId, currencyType, decentralized, isShieldAddressDecentralized });
    }
  };

  React.useEffect(() => {
    if (fromApi && historyId && onPullRefresh && data?.history?.currencyType) {
      handleRefresh();
    }
  }, []);

  return (
    <ScrollView
      refreshControl={
        fromApi && (
          <RefreshControl
            refreshing={isRefresh}
            onRefresh={handleRefresh}
          />
        )
      }
    >
      {historyFactories.map((hook, index) => (
        <Hook key={index} {...hook} flexExtra={isBTCInvalidAmount ? 12 : 5} />
      ))}
      {!!history?.depositAddress && (history.statusCode === 0 || isInvalidAmount) && (
        <QrCodeAddressDefault
          label="Shielding address"
          address={history?.depositAddress}
          isPending={history.statusCode === 0}
          symbol={history.symbol}
          min={minShield}
        />
      )}
      {toggleTxHistoryDetail && (
        <ButtonBasic
          title="Copy"
          btnStyle={{ marginTop: 30 }}
          onPress={onCopyData}
        />
      )}
      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

TxHistoryDetail.propTypes = {
  data: PropTypes.shape({
    typeText: PropTypes.string,
    balanceDirection: PropTypes.string,
    statusMessage: PropTypes.string,
    statusColor: PropTypes.string,
    history: PropTypes.object,
  }).isRequired,
  onRetryExpiredDeposit: PropTypes.func.isRequired,
  historyId: PropTypes.string.isRequired,
  /* handle for history status below */
  onRetryHistoryStatus: PropTypes.func.isRequired,
  showReload: PropTypes.bool.isRequired,
  fetchingHistory: PropTypes.bool.isRequired,
  /* Handle pull refresh */
  isRefresh: PropTypes.bool.isRequired,
  onPullRefresh: PropTypes.func.isRequired,
  minShield: PropTypes.number.isRequired,
};

export default React.memo(TxHistoryDetail);
