import React from 'react';
import Swipeout from 'react-native-swipeout';
import {
  LoadingContainer, RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from '@src/components/core';
import { FlatList } from '@components/core/FlatList';
import { COLORS } from '@src/styles';
import PropTypes from 'prop-types';
import { generateTestId } from '@utils/misc';
import { TOKEN } from '@src/constants/elements';
import trim from 'lodash/trim';
import { useNavigation } from 'react-navigation-hooks';
import { useDispatch, useSelector } from 'react-redux';
import { actionSetSelectedTx } from '@src/redux/actions/history';
import routeNames from '@src/router/routeNames';
import { colorsSelector } from '@src/theme';
import globalStyled from '@src/theme/theme.styled';
import { isEmpty, debounce } from 'lodash';
import { IconReward } from '@src/components/Icons';
import styleSheet from './History.styled';

const HistoryItemWrapper = ({ history, onCancelEtaHistory, ...otherProps }) =>
  React.useMemo(() => {
    const component = <HistoryItem history={history} {...otherProps} />;
    if (history?.cancelable) {
      return (
        <Swipeout
          autoClose
          sensitivity={1000}
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

const NormalText = React.memo(({ style, text, testId, ...rest }) => (
  <Text
    numberOfLines={1}
    style={[styleSheet.text, style]}
    ellipsizeMode="tail"
    {...generateTestId(testId)}
    {...rest}
  >
    {trim(text)}
  </Text>
));

const HistoryItem = React.memo(({ history }) => {
  const { amountStr, txTypeStr, timeStr, statusStr, statusColor, rewardAmountStr } = history;
  const colors = useSelector(colorsSelector);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  if (!history) {
    return null;
  }
  const onPress = () => {
    dispatch(actionSetSelectedTx(history));
    navigation.navigate(routeNames.TxHistoryDetail);
  };
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styleSheet.itemContainer,
        globalStyled.defaultPaddingHorizontal,
        { borderBottomColor: colors.border4, borderBottomWidth: 1 },
      ]}
    >
      <View style={[styleSheet.row]}>
        <NormalText
          text={txTypeStr}
          style={[styleSheet.title, { maxWidth: 250 }]}
          testId={TOKEN.TRANSACTION_TYPE}
        />
        <View style={styleSheet.amountContainer}>
          {!isEmpty(rewardAmountStr) && (
            <View style={styleSheet.rewardAmountContainer}>
              <Text style={styleSheet.rewardAmountText}>+</Text>
              <IconReward />
            </View>
          )}
          <NormalText
            text={amountStr}
            style={styleSheet.title}
            testId={TOKEN.TRANSACTION_CONTENT}
          />
        </View>
      </View>
      <View style={styleSheet.row}>
        <NormalText
          style={styleSheet.desc}
          text={timeStr}
          testId={TOKEN.TRANSACTION_TIME}
        />
        <NormalText
          style={[styleSheet.desc, !!statusColor && { color: statusColor }]}
          text={statusStr}
          testId={TOKEN.TRANSACTION_STATUS}
        />
      </View>
    </TouchableOpacity>
  );
});

const HistoryList = (props) => {
  const {
    histories,
    showEmpty,
    renderEmpty,
    refreshing,
    onRefreshHistoryList,
    onLoadmoreHistory,
    onCancelEtaHistory,
    loading,
    page
  } = props;
  const initing = loading && histories.length === 0;
  if (initing) {
    return (
      <LoadingContainer
        containerStyled={{
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      />
    );
  }

  const renderItem = React.useCallback(({ item: history }) => {
    return <HistoryItemWrapper {...{ history, onCancelEtaHistory }} />;
  }, []);
  const getItemLayout = React.useCallback((data, index) => (
    { length: 74, offset: 74 * index, index}
  ), []);

  const onEndReached = React.useCallback(() =>
      typeof onLoadmoreHistory === 'function' && onLoadmoreHistory(),
    [onLoadmoreHistory]);

  const _onEndReached = debounce(onEndReached, 1000);
  const historyDisplay = React.useMemo(() => {
    return histories.slice(0, page);
  }, [page, histories.length, histories]);

  const renderKey = React.useCallback((item) => item?.txId || item?.id, []);
  return (
    <FlatList
      refreshControl={(
        <RefreshControl
          refreshing={refreshing && !initing}
          onRefresh={() =>
            typeof onRefreshHistoryList === 'function' && onRefreshHistoryList()}
        />
      )}
      data={historyDisplay}
      renderItem={renderItem}
      keyExtractor={renderKey}
      onEndReachedThreshold={0.7}
      onEndReached={_onEndReached}
      getItemLayout={getItemLayout}
      ListFooterComponent={<View style={{ marginBottom: 30 }} />}
      ListEmptyComponent={
        showEmpty && typeof renderEmpty === 'function' && renderEmpty()
      }
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
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
  loading: false,
  page: 1000
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
  loading: PropTypes.bool,
  page: PropTypes.number
};

export default React.memo(HistoryList);
