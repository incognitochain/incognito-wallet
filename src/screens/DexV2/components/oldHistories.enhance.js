import React, { useState } from 'react';
import _ from 'lodash';
import { getHistoryStatus, getHistories } from '@src/redux/actions/dex';
import { useDispatch } from 'react-redux';
import { LONG_DATE_TIME_FORMAT } from '@utils/format';
import moment from 'moment';
import { MESSAGES } from '@screens/Dex/constants';

const withOldHistories = WrappedComp => (props) => {
  const [histories, setHistories] = useState([]);
  const dispatch = useDispatch();

  const loadHistories = async () => {
    const oldHistories = (await dispatch(getHistories()))
      .filter(item => item.type !== MESSAGES.TRADE)
      .map(item => ({
        ...item,
        outputToken: item.outputToken?.replace(/^p/g, ''),
        inputToken: item.inputToken?.replace(/^p/g, ''),
        networkFeeUnit: item.networkFeeUnit?.replace(/^p/g, ''),
      }));
    const promises = await oldHistories.map(item => dispatch(getHistoryStatus(item)));
    const histories = await Promise.all(promises)
      .then(data => data.map(item => ({
        DepositID: 0,
        sellAmount: item.inputValue,
        sellTokenId: item.inputTokenId,
        sellTokenSymbol: item.inputToken,
        buyAmount: item.outputValue,
        buyTokenId: item.outputTokenId,
        buyTokenSymbol: item.outputToken,
        networkFee: item.networkFee,
        networkFeeTokenSymbol: item.networkFeeUnit,
        createdAt: moment(item.lockTime * 1000).format(LONG_DATE_TIME_FORMAT),
        type: 'Trade',
        description: `${item.inputValue} ${item.inputToken} to ${item.outputValue} ${item.outputToken}`,
        status: _.capitalize(item.status),
        account: 'pDEX',
      })));

    setHistories(histories);
  };

  React.useEffect(() => {
    loadHistories();
  }, []);

  return (
    <WrappedComp
      {...{
        ...props,
        oldHistories: histories,
      }}
    />
  );
};

export default withOldHistories;
