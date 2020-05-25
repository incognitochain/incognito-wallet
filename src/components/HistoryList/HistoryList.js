import {
  Container,
  Divider,
  Text,
  TouchableOpacity,
  View,
} from '@src/components/core';
import { CONSTANT_COMMONS } from '@src/constants';
import routeNames from '@src/router/routeNames';
import {
  ConfirmedTx,
  FailedTx,
  SuccessTx,
} from '@src/services/wallet/WalletService';
import { COLORS } from '@src/styles';
import formatUtil from '@src/utils/format';
import PropTypes from 'prop-types';
import React from 'react';
import { generateTestId } from '@utils/misc';
import { TOKEN } from '@src/constants/elements';
import Swipeout from 'react-native-swipeout';
import { useNavigation } from 'react-navigation-hooks';
import styleSheet from './style';

const getStatusData = (status, statusCode, decentralized) => {
  let statusText;
  let statusColor;
  let statusNumber;
  if (decentralized) {
    if (statusCode && (statusCode === 9 || statusCode === 10)) {
      statusText = 'Failed';
      statusColor = COLORS.red;
      return {
        statusText,
        statusColor,
        statusNumber,
      };
    }
  }

  switch (status) {
  case CONSTANT_COMMONS.HISTORY.STATUS_TEXT.PENDING:
    statusNumber = statusCode;
    statusText = 'Pending';
    statusColor = COLORS.blue;
    break;
  case SuccessTx:
    statusNumber = null;
    statusText = 'Pending';
    statusColor = COLORS.blue;
    break;
  case CONSTANT_COMMONS.HISTORY.STATUS_TEXT.SUCCESS:
  case ConfirmedTx:
    statusText = 'Complete';
    statusColor = COLORS.green;
    break;
  case CONSTANT_COMMONS.HISTORY.STATUS_TEXT.FAILED:
  case FailedTx:
    statusText = 'Failed';
    statusColor = COLORS.red;
    break;
  case CONSTANT_COMMONS.HISTORY.STATUS_TEXT.EXPIRED:
    statusText = 'Expired';
    statusColor = COLORS.orange;
    break;
  default:
    statusText = '';
    statusColor = COLORS.lightGrey1;
  }

  return {
    statusText,
    statusColor,
    statusNumber,
  };
};

const getTypeData = (type, history) => {
  let typeText;
  let balanceDirection;
  let balanceColor;

  switch (type) {
  case CONSTANT_COMMONS.HISTORY.TYPE.WITHDRAW:
    typeText = 'Withdraw';
    balanceColor = COLORS.red;
    balanceDirection = '-';
    break;
  case CONSTANT_COMMONS.HISTORY.TYPE.DEPOSIT:
    typeText = history?.userPaymentAddress ? 'Deposit' : 'Withdraw to pDEX';
    balanceColor = COLORS.green;
    balanceDirection = '+';
    break;
  case CONSTANT_COMMONS.HISTORY.TYPE.SEND:
    typeText = 'Send';
    balanceColor = COLORS.orange;
    balanceDirection = '-';
    break;
  case CONSTANT_COMMONS.HISTORY.TYPE.RECEIVE:
    typeText = 'Receive';
    balanceColor = COLORS.green;
    balanceDirection = '+';
    break;
  }

  return {
    typeText,
    balanceColor,
    balanceDirection,
  };
};

// const getAddress = history => {
//   if ([CONSTANT_COMMONS.HISTORY.TYPE.SEND, CONSTANT_COMMONS.HISTORY.TYPE.WITHDRAW].includes(history?.type)) {
//     return ['To', history?.toAddress];
//   } else if ([CONSTANT_COMMONS.HISTORY.TYPE.DEPOSIT].includes(history?.type)) {
//     return ['From', history?.fromAddress];
//   }
// };

const HistoryItemWrapper = ({ history, onCancelEtaHistory, ...otherProps }) => {
  const component = <HistoryItem history={history} {...otherProps} />;
  if (history?.cancelable) {
    return (
      <Swipeout
        autoClose
        style={{
          backgroundColor: 'transparent',
        }}
        right={[
          {
            text: 'Remove',
            backgroundColor: COLORS.red,
            onPress: () => onCancelEtaHistory(history),
          },
        ]}
      >
        {component}
      </Swipeout>
    );
  }

  return component;
};

const HistoryItem = ({ history }) => {
  const navigation = useNavigation();
  if (!history) {
    return null;
  }
  const { statusText, statusColor, statusNumber } = getStatusData(
    history.status,
    history.statusCode,
    history.decentralized,
  );
  const { typeText, balanceColor, balanceDirection } = getTypeData(
    history.type,
    history,
  );
  const amount =
    (history.amount && formatUtil.amount(history.amount, history.pDecimals)) ||
    formatUtil.number(history.requestedAmount);
  // const [addressDirection, address] = getAddress(history);
  const onPress = () => {
    navigation?.navigate(routeNames.TxHistoryDetail, {
      data: {
        history,
        typeText,
        balanceColor,
        balanceDirection,
        statusText,
        statusColor,
        statusNumber,
      },
    });
  };

  return (
    <TouchableOpacity onPress={onPress} style={styleSheet.itemContainer}>
      <View style={[styleSheet.row, styleSheet.rowTop]}>
        <Text
          style={[styleSheet.title, styleSheet.leftText]}
          numberOfLines={1}
          ellipsizeMode="tail"
          {...generateTestId(TOKEN.TRANSACTION_TYPE)}
        >
          {typeText}
        </Text>
        <Text
          style={[styleSheet.title, styleSheet.righText]}
          numberOfLines={1}
          ellipsizeMode="tail"
          {...generateTestId(TOKEN.TRANSACTION_CONTENT)}
        >
          {amount ? amount : ''}
        </Text>
      </View>
      <View style={styleSheet.row}>
        <Text
          style={[styleSheet.desc, styleSheet.leftText]}
          numberOfLines={1}
          ellipsizeMode="tail"
          {...generateTestId(TOKEN.TRANSACTION_TIME)}
        >
          {formatUtil.formatDateTime(history.time)}
        </Text>
        <Text
          style={[styleSheet.desc, styleSheet.righText]}
          numberOfLines={1}
          ellipsizeMode="tail"
          {...generateTestId(TOKEN.TRANSACTION_STATUS)}
        >
          {statusText}{' '}
          {!!statusNumber || statusNumber === 0 ? `[${statusNumber}]` : null}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const HistoryList = ({ histories, onCancelEtaHistory }) => (
  <View style={styleSheet.container}>
    {histories.map(history => (
      <HistoryItemWrapper
        key={history.id}
        history={history}
        onCancelEtaHistory={onCancelEtaHistory}
      />
    ))}
  </View>
);

HistoryItem.defaultProps = {
  history: {
    id: null,
    time: null,
    type: null,
    amount: null,
    symbol: null,
    fromAddress: null,
    toAddress: null,
    statusCode: null,
    status: null,
  },
};

HistoryItem.propTypes = {
  history: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    time: PropTypes.string,
    type: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    symbol: PropTypes.string,
    fromAddress: PropTypes.string,
    toAddress: PropTypes.string,
    statusCode: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    decentralized: PropTypes.number,
    cancelable: PropTypes.bool,
    canRetryExpiredDeposit: PropTypes.bool,
    pDecimals: PropTypes.number,
    requestedAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    expiredAt: PropTypes.string,
    depositAddress: PropTypes.string,
    userPaymentAddress: PropTypes.string,
    erc20TokenAddress: PropTypes.string,
    privacyTokenAddress: PropTypes.string,
    walletAddress: PropTypes.string,
  }),
};

HistoryList.defaultProps = {
  histories: [],
  onCancelEtaHistory: null,
};

HistoryList.propTypes = {
  histories: PropTypes.array,
  onCancelEtaHistory: PropTypes.func,
};

export default HistoryList;
