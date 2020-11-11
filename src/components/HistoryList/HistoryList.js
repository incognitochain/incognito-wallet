import {
  Text,
  TouchableOpacity,
  View,
  LoadingContainer,
} from '@src/components/core';
import { FlatList } from '@components/core/FlatList';
import routeNames from '@src/router/routeNames';
import { COLORS } from '@src/styles';
import formatUtil from '@src/utils/format';
import PropTypes from 'prop-types';
import React from 'react';
import { generateTestId } from '@utils/misc';
import { TOKEN } from '@src/constants/elements';
import Swipeout from 'react-native-swipeout';
import { useNavigation } from 'react-navigation-hooks';
import trim from 'lodash/trim';
import { useSelector } from 'react-redux';
import { decimalDigitsSelector } from '@src/screens/Setting';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import styleSheet from './style';
import { getStatusData, getTypeData } from './HistoryList.utils';

const HistoryItemWrapper = ({ history, onCancelEtaHistory, ...otherProps }) =>
  React.useMemo(() => {
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
  }, [history]);

const NormalText = ({ style, text, ...rest }) => (
  <Text
    numberOfLines={1}
    style={[styleSheet.text, style]}
    ellipsizeMode="tail"
    {...rest}
  >
    {trim(text)}
  </Text>
);

const HistoryItem = React.memo(({ history }) => {
  const navigation = useNavigation();
  const decimalDigits = useSelector(decimalDigitsSelector);
  const account = useSelector(defaultAccountSelector);
  const { pDecimals, amount } = history;
  if (!history) {
    return null;
  }
  const { statusMessage, statusColor } = getStatusData(history);
  const { typeText } = getTypeData(
    history.type,
    history,
    account?.paymentAddress,
  );
  const renderAmount = () => {
    const amountToNumber = Number(amount) || 0;
    if (!amountToNumber) {
      return '';
    }
    const _amount = formatUtil.amount(amount, pDecimals, true, decimalDigits);
    return trim(_amount);
  };
  const onPress = () => {
    navigation?.navigate(
      history?.isHistoryReceived
        ? routeNames.TxHistoryReceive
        : routeNames.TxHistoryDetail,
      {
        data: {
          history,
          typeText,
          statusColor,
          statusMessage,
        },
      },
    );
  };
  return (
    <TouchableOpacity onPress={onPress} style={styleSheet.itemContainer}>
      <View style={[styleSheet.row, styleSheet.rowTop]}>
        <NormalText
          text={typeText}
          style={styleSheet.title}
          {...generateTestId(TOKEN.TRANSACTION_TYPE)}
        />
        <NormalText
          text={renderAmount()}
          style={styleSheet.title}
          {...generateTestId(TOKEN.TRANSACTION_CONTENT)}
        />
      </View>
      <View style={styleSheet.row}>
        <NormalText
          style={styleSheet.desc}
          text={formatUtil.formatDateTime(history.time)}
          {...generateTestId(TOKEN.TRANSACTION_TIME)}
        />
        <NormalText
          style={[styleSheet.desc]}
          {...generateTestId(TOKEN.TRANSACTION_STATUS)}
          text={statusMessage}
        />
      </View>
    </TouchableOpacity>
  );
});

const HistoryList = ({
  histories,
  onCancelEtaHistory,
  onRefreshHistoryList,
  onLoadmoreHistory,
  refreshing,
  renderEmpty,
  showEmpty,
  oversize,
}) => (
  <FlatList
    data={histories.sort(
      (a, b) => new Date(b?.time).getTime() - new Date(a?.time).getTime(),
    )}
    renderItem={({ item: history }) => {
      return <HistoryItemWrapper {...{ history, onCancelEtaHistory }} />;
    }}
    keyExtractor={(item) => item?.id}
    onRefresh={() =>
      typeof onRefreshHistoryList === 'function' && onRefreshHistoryList()
    }
    refreshing={refreshing}
    onEndReached={() =>
      typeof onLoadmoreHistory === 'function' && onLoadmoreHistory()
    }
    ListFooterComponent={
      !oversize && !refreshing ? (
        <View style={styleSheet.loadingContainer}>
          <LoadingContainer />
        </View>
      ) : (
        <View style={{ marginBottom: 30 }} />
      )
    }
    ListEmptyComponent={
      showEmpty && typeof renderEmpty === 'function' && renderEmpty()
    }
  />
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
  onRefreshHistoryList: null,
  refreshing: false,
  onLoadmoreHistory: null,
  oversize: false,
  renderEmpty: null,
  showEmpty: false,
};

HistoryList.propTypes = {
  histories: PropTypes.array,
  onCancelEtaHistory: PropTypes.func,
  onRefreshHistoryList: PropTypes.func,
  onLoadmoreHistory: PropTypes.func,
  refreshing: PropTypes.bool,
  oversize: PropTypes.bool,
  renderEmpty: PropTypes.func,
  showEmpty: PropTypes.bool,
};

NormalText.propTypes = {
  style: PropTypes.any,
  text: PropTypes.string,
};

NormalText.defaultProps = {
  style: null,
  text: '',
};

export default HistoryList;
