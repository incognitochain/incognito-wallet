import React from 'react';
import { MAX_WAITING_TIME, MESSAGES, PRV_ID, WAIT_TIME } from '@screens/Dex/constants';
import { COINS } from '@src/constants';
import { ExHandler } from '@services/exception';
import accountService from '@services/wallet/accountService';
import { WithdrawHistory } from '@models/dexHistory';
import { useDispatch } from 'react-redux';
import { addHistory, updateHistory } from '@src/redux/actions/dex';

const MAX_TRIED = MAX_WAITING_TIME / WAIT_TIME;

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
    dexWithdrawAccount,
    prvBalance,
  } = props;

  const handleAddHistory = (history) => {
    dispatch(addHistory(history));
  };

  const handleUpdateHistory = (history) => {
    dispatch(updateHistory(history));
  };

  const checkCorrectBalance = (account, token, value) => {
    let tried = 0;
    return new Promise(async (resolve, reject) => {
      const interval = setInterval(async () => {
        const balance = await accountService.getBalance(account, wallet, token.id);

        console.debug('BALANCE', balance);

        if (balance >= value) {
          clearInterval(interval);
          WithdrawHistory.currentWithdraw.checking = true;
          resolve(balance);
        }

        if (tried++ > MAX_TRIED) {
          clearInterval(interval);
          reject(MESSAGES.SOMETHING_WRONG);
        }
      }, WAIT_TIME);
    });
  };

  const confirm = async () => {
    setProcessing(true);

    let newHistory;
    let res1;
    let res2;

    const rawFee = Math.floor(fee / 2);

    try {
      if (coin.balance < value) {
        return setError(MESSAGES.NOT_ENOUGH_BALANCE(coin.symbol));
      }

      if (prvBalance < fee) {
        return setError(MESSAGES.NOT_ENOUGH_PRV_NETWORK_FEE);
      }

      WithdrawHistory.withdrawing = true;

      const paymentInfo = coin.id === PRV_ID ? {
        paymentAddressStr: dexWithdrawAccount.PaymentAddress,
        amount: rawFee,
      } : null;

      res1 = await accountService.createAndSendToken(
        dexMainAccount,
        wallet,
        dexWithdrawAccount.PaymentAddress,
        value + (coin.id === PRV_ID ? rawFee : 0),
        coin.id,
        rawFee,
        0,
        paymentInfo,
      );
      newHistory = new WithdrawHistory(res1, coin, value, rawFee, COINS.PRV.symbol, account);
      handleAddHistory(newHistory);
      await checkCorrectBalance(dexWithdrawAccount, COINS.PRV, value + rawFee);
      res2 = await accountService.createAndSendToken(
        dexWithdrawAccount,
        wallet,
        account.PaymentAddress,
        value,
        coin.id,
        rawFee,
        0,
      );

      newHistory.updateTx2(res2);
      WithdrawHistory.currentWithdraw = null;
      handleUpdateHistory(newHistory);
      onSuccess(true);
    } catch (error) {
      WithdrawHistory.currentWithdraw = null;
      handleUpdateHistory(newHistory);
      setError(new ExHandler(error).getMessage());
    } finally {
      WithdrawHistory.withdrawing = false;
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
