import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { View, Text, ScrollView, FlexView } from '@components/core';
import { withLayout_2 } from '@components/Layout';
import Header from '@components/Header/index';
import ExtraInfo from '@screens/DexV2/components/ExtraInfo';
import { MESSAGES } from '@src/constants';
import { HISTORY_STATUS } from '@src/constants/trading';
import { useSelector } from 'react-redux';
import { maxPriceSelector } from '@screens/DexV2/components/Trade/TradeV2/Trade.selector';
import styles from './style';
import withData from './data.enhance';

const HistoryDetail = ({ history }) => {
  const isSuccess = history?.status === HISTORY_STATUS.SUCCESSFUL;
  const buyAmount = isSuccess
  && history?.amountReceive
    ? history?.amountReceive
    : history?.buyAmount;

  const maxPrice = useSelector(maxPriceSelector)(
    history?.sellTokenId,
    history?.buyTokenId,
    history?.sellAmount,
    buyAmount,
  );

  let factories = [
    {
      left: 'ID',
      right: history?.id,
    },
    {
      left: 'Buy',
      right: `${buyAmount} ${history?.buyTokenSymbol}`,
    },
    {
      left: 'Sell',
      right: `${history?.sellAmount} ${history?.sellTokenSymbol}`,
    },
    {
      left: 'Fee',
      right: `${history?.networkFee} ${history?.networkFeeTokenSymbol}`,
    },
    {
      left: 'Time',
      right: history?.createdAt,
    },
    {
      left: 'Status',
      right: history?.status,
      message: history?.status === HISTORY_STATUS.DEPOSIT_FAILD ? MESSAGES.DEPOSIT_FAILED : null,
    },
    {
      left: 'Account',
      right: history?.account,
    },
    {
      left: 'Trading fee',
      right: history?.tradingFee,
      disabled: !history?.tradingFee,
    },
    {
      left: 'Exchange',
      right: history?.exchange,
    },
    maxPrice && {
      left: isSuccess ? 'Price' : 'Max price',
      right: maxPrice,
    },
  ];
  factories = factories.map((item) => ({
    ...item,
    disabled: item?.disabled || false,
  }));
  return (
    <FlexView>
      <Header title="pDEX" />
      <View style={styles.historyItem}>
        <Text style={styles.buttonTitle}>{history?.type}</Text>
        <Text style={styles.content}>{history?.description}</Text>
      </View>
      <ScrollView paddingBottom>
        {factories.map(
          (item) => !item?.disabled && <ExtraInfo key={item?.left} {...item} />,
        )}
      </ScrollView>
    </FlexView>
  );
};

HistoryDetail.propTypes = {
  history: PropTypes.object.isRequired,
};

HistoryDetail.defaultProps = {};

export default compose(
  withLayout_2,
  withData,
)(HistoryDetail);
