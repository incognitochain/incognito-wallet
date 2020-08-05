import React from 'react';
import { MESSAGES } from '@screens/Dex/constants';
import { COINS } from '@src/constants';
import { ExHandler } from '@services/exception';
import accountService from '@services/wallet/accountService';
import { DepositHistory } from '@models/dexHistory';
import { useDispatch } from 'react-redux';
import { addHistory } from '@src/redux/actions/dex';
import { setWallet } from '@src/redux/actions/wallet';
import TokenModel from '@models/token';


const withConfirm = WrappedComp => (props) => {
  const [error, setError] = React.useState('');
  const [processing, setProcessing] = React.useState(false);
  const dispatch = useDispatch();
  const {
    value,
    coin,
    fee,
    onSuccess,
    wallet,
    account,
    dexMainAccount,
    prvBalance,
  } = props;

  const handleAddHistory = (history) => {
    dispatch(addHistory(history));
  };

  const confirm = async () => {
    setProcessing(true);
    try {
      if (coin.balance < value) {
        return setError(MESSAGES.NOT_ENOUGH_BALANCE(coin.symbol));
      }

      if (prvBalance < fee) {
        return setError(MESSAGES.NOT_ENOUGH_PRV_NETWORK_FEE);
      }

      const result = await accountService.createAndSendToken(
        account,
        wallet,
        dexMainAccount.PaymentAddress,
        value,
        coin.id,
        fee,
        0,
      );

      if (coin.id && coin.id !== COINS.PRV_ID) {
        await accountService.addFollowingTokens([TokenModel.toJson(coin)], dexMainAccount, wallet);
        dispatch(setWallet(wallet));
      }

      if (result && result.txId) {
        handleAddHistory(new DepositHistory(result, coin, value, fee, COINS.PRV.symbol, account));
        onSuccess(true);
      }

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
