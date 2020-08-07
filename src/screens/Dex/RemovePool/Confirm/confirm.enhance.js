import React from 'react';
import { ExHandler } from '@services/exception';
import accountService from '@services/wallet/accountService';
import { RemoveLiquidityHistory } from '@models/dexHistory';
import { addHistory } from '@src/redux/actions/dex';
import { useDispatch } from 'react-redux';

const withConfirm = WrappedComp => (props) => {
  const [error, setError] = React.useState('');
  const [processing, setProcessing] = React.useState(false);
  const dispatch = useDispatch();
  const {
    pair,
    fee,
    onSuccess,
    account,
    wallet,
    value,
    topText,
    bottomText,
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

  const handleAddHistory = (history) => {
    dispatch(addHistory(history));
  };

  const confirm = async () => {
    if (processing) {
      return;
    }

    let newHistory;
    setProcessing(true);
    setError('');

    try {
      const { token1, token2 } = pair;
      const res = await accountService.createAndSendWithdrawDexTx(wallet, account, fee, token1.id, token2.id, value);
      const token1Params = createTokenParams(token1, topText);
      const token2Params = createTokenParams(token2, bottomText);

      newHistory = new RemoveLiquidityHistory(res, value, token1Params, token2Params, fee, account);
      handleAddHistory(newHistory);

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
