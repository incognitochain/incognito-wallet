import React from 'react';
import { MESSAGES, PRV_ID, SECOND } from '@screens/Dex/constants';
import { ExHandler } from '@services/exception';
import accountService from '@services/wallet/accountService';
import { getTransactionByHash } from '@services/wallet/RpcClientService';
import { AddLiquidityHistory } from '@models/dexHistory';
import { addHistory, updateHistory } from '@src/redux/actions/dex';
import { useDispatch } from 'react-redux';

const withConfirm = WrappedComp => (props) => {
  const [error, setError] = React.useState('');
  const [processing, setProcessing] = React.useState(false);
  const dispatch = useDispatch();
  const {
    firstCoin,
    secondCoin,
    fee,
    onSuccess,
    account,
    wallet,
  } = props;

  const createTokenParams = (token, amount) => {
    return {
      Privacy: true,
      TokenID: token.id,
      TokenName: token.name,
      TokenSymbol: token.symbol,
      TokenAmount: amount,
      TokenFee: 0,
      PDecimals: token.pDecimals,
    };
  };

  const addToken = (token, value, pairId, fee) => {
    if (token.id === PRV_ID) {
      return accountService.createAndSendTxWithNativeTokenContribution(wallet, account, fee, pairId, value);
    } else {
      const tokenParams = createTokenParams(token);
      return accountService.createAndSendPTokenContributionTx(wallet, account, tokenParams, fee, 0, pairId, value);
    }
  };

  const waitTxComplete = (txId) => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        const res = await getTransactionByHash(txId);
        if (res.isInBlock) {
          resolve();
          clearInterval(interval);
        } else if (res.err) {
          reject(MESSAGES.TX_REJECTED);
          clearInterval(interval);
        }
      }, 40 * SECOND);
    });
  };

  const confirm = async () => {
    if (processing) {
      return;
    }

    let newHistory;
    setProcessing(true);
    setError('');

    const handleAddHistory = (history) => {
      dispatch(addHistory(history));
    };

    const handleUpdateHistory = (history) => {
      dispatch(updateHistory(history));
    };

    try {
      const pa = account.PaymentAddress;
      const timestamp = new Date().getTime().toString();
      const pairId = `${pa.slice(0, 6)}-${firstCoin.symbol}-${secondCoin.symbol}-${timestamp}`;

      const res = await addToken(firstCoin, firstCoin.value, pairId, fee);
      const inputParams = createTokenParams(firstCoin, firstCoin.value);
      const outputParams = createTokenParams(secondCoin, secondCoin.value);

      newHistory = new AddLiquidityHistory(res, pairId, inputParams, outputParams, fee, fee, account);
      handleAddHistory(newHistory);
      const txId = res.txId;
      await waitTxComplete(txId);
      const res2 = await addToken(secondCoin, secondCoin.value, pairId, fee);
      newHistory.updateTx2(res2);

      handleUpdateHistory(newHistory);

      onSuccess();
    } catch (error) {
      setError(new ExHandler(error).getMessage());
    } finally {
      setProcessing(false);
    }
  };

  return (
    <WrappedComp
      {...{
        ...props,
        processing,
        onConfirm: confirm,
        error,
      }}
    />
  );
};

export default withConfirm;
