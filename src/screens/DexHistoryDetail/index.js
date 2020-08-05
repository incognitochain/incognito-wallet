import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Overlay} from 'react-native-elements';
import {Button, ScrollView, View} from '@components/core';
import FullScreenLoading from '@components/FullScreenLoading/index';
import {MAX_WAITING_TIME, MESSAGES, MIN_CANCEL_VALUE, SHORT_WAIT_TIME} from '@screens/Dex/constants';
import {CONSTANT_COMMONS} from '@src/constants';
import tokenService, {PRV} from '@services/wallet/tokenService';
import accountService from '@services/wallet/accountService';
import Toast from '@components/core/Toast/Toast';
import {DEX} from '@utils/dex';
import {deleteHistory, getHistoryStatus, updateHistory} from '@src/redux/actions/dex';
import {connect} from 'react-redux';
import {ExHandler} from '@services/exception';
import AddPin from '@screens/AddPIN';
import routeNames from '@routers/routeNames';
import { Header } from '@src/components';
import { withLayout_2 } from '@components/Layout/index';
import TradeHistory from './TradeHistory';
import WithdrawHistory from './WithdrawHistory';
import DepositHistory from './DepositHistory';
import AddLiquidityHistory from './AddLiquidityHistory';
import RemoveLiquidityHistory from './RemoveLiquidityHistory';
import stylesheet from './style';

const MAX_TRIED = MAX_WAITING_TIME / SHORT_WAIT_TIME;

const HISTORY_TYPES = {
  [MESSAGES.DEPOSIT]: DepositHistory,
  [MESSAGES.WITHDRAW]: WithdrawHistory,
  [MESSAGES.TRADE]: TradeHistory,
  [MESSAGES.ADD_LIQUIDITY]: AddLiquidityHistory,
  [MESSAGES.REMOVE_LIQUIDITY]: RemoveLiquidityHistory
};

let currentInterval;

const sendPToken = (wallet, fromAccount, toAccount, token, amount, paymentInfo, prvFee = 0, tokenFee = 0) => {
  const tokenObject = {
    Privacy: true,
    TokenID: token.id,
    TokenName: token.name,
    TokenSymbol: token.symbol,
    TokenTxType: CONSTANT_COMMONS.TOKEN_TX_TYPE.SEND,
    TokenAmount: amount,
    TokenReceivers: [{
      PaymentAddress: toAccount.PaymentAddress,
      Amount: amount
    }]
  };

  console.debug('SEND PTOKEN', tokenObject, amount, prvFee, tokenFee, fromAccount.AccountName);

  return tokenService.createSendPToken(
    tokenObject,
    prvFee,
    fromAccount,
    wallet,
    paymentInfo,
    tokenFee,
  );
};

const sendPRV = async (wallet, fromAccount, toAccount, amount, prvFee = 0) => {
  const paymentInfos = [{
    paymentAddressStr: toAccount.PaymentAddress,
    amount: amount
  }];

  console.debug('SEND PRV', paymentInfos, amount, prvFee, fromAccount.AccountName);

  return accountService.createAndSendNativeToken(paymentInfos, prvFee, true, fromAccount, wallet);
};

const waitUntil = (func, ms) => {
  return new Promise((resolve, reject) => {
    currentInterval = setInterval(func.bind(this, resolve, reject), ms);
  });
};

const checkCorrectBalance = (wallet, account, token, value) => {
  let tried = 0;
  return async (resolve, reject) => {
    const balance = await accountService.getBalance(account, wallet, token.id);

    console.debug('BALANCE', balance);

    if (balance >= value) {
      clearInterval(currentInterval);
      return resolve(balance);
    }

    if (tried++ > MAX_TRIED) {
      reject(MESSAGES.SOMETHING_WRONG);
    }
  };
};

const addToken = (wallet, account, token, value, pairId, fee) => {
  if (token.TokenID === PRV.id) {
    return accountService.createAndSendTxWithNativeTokenContribution(wallet, account, fee, pairId, value);
  } else {
    console.debug('Add Token', account.PaymentAddress, token, fee, pairId, value);
    return accountService.createAndSendPTokenContributionTx(wallet, account, token, fee, 0, pairId, value);
  }
};

const DexHistoryDetail = ({ navigation, wallet, updateHistory, getHistoryStatus, deleteHistory }) => {
  const { params } = navigation.state;
  const { history } = params;
  const [loading, setLoading] = React.useState(false);
  const History = HISTORY_TYPES[history.type];

  const continueWithdraw = async () => {
    if (loading) {
      return;
    }

    try {
      WithdrawHistory.withdrawing = true;
      setLoading(MESSAGES.WITHDRAW_PROCESS);
      const accounts = await wallet.listAccount();
      const dexWithdrawAccount = accounts.find(item => item.AccountName === DEX.WITHDRAW_ACCOUNT);
      const { tokenId, amount, networkFee, networkFeeUnit, pDecimals, paymentAddress, account: accountName, tokenSymbol, tokenName } = history;
      const token = { id: tokenId, symbol: tokenSymbol, pDecimals, name: tokenName || '' };
      const account = { AccountName: accountName, PaymentAddress: paymentAddress };
      const fee = _.floor(networkFee / 2, 0);
      let res;
      if (token.id === PRV.id) {
        await waitUntil(checkCorrectBalance(wallet, dexWithdrawAccount, PRV, amount + fee), SHORT_WAIT_TIME);
        res = await sendPRV(wallet, dexWithdrawAccount, account, amount, fee);
      } else {
        const tokenFee = networkFeeUnit !== PRV.symbol ? fee : 0;
        await waitUntil(checkCorrectBalance(wallet, dexWithdrawAccount, token, amount + tokenFee), SHORT_WAIT_TIME);
        res = await sendPToken(wallet, dexWithdrawAccount, account, token, amount, null, tokenFee ? 0 : fee, tokenFee);
      }

      history.updateTx2(res);
      updateHistory(history);
      await getHistoryStatus(history);
      Toast.showSuccess(MESSAGES.WITHDRAW_COMPLETED);
    } catch (error) {
      updateHistory(history);
      Toast.showError(new ExHandler(error).getMessage());
    } finally {
      WithdrawHistory.withdrawing = false;
      setLoading('');
      if (AddPin.waiting) {
        navigation.navigate(routeNames.AddPin, {action: 'login'});
      }
    }
  };

  const validate = async (paymentAddress, token, pairId, fee) => {
    const accounts = await wallet.listAccount();
    const account = accounts.find(item => item.PaymentAddress === paymentAddress);

    if (!account) {
      throw new Error(MESSAGES.ACCOUNT_NOT_FOUND);
    }

    const prvBalance = await accountService.getBalance(account, wallet);
    const tokenBalance = await accountService.getBalance(account, wallet, token.TokenID);
    const tokenFee = token.TokenID === PRV.id ? fee : 0;

    if (tokenBalance < tokenFee + token.TokenAmount) {
      throw new Error(MESSAGES.NOT_ENOUGH_BALANCE_ADD(token.TokenSymbol));
    }

    if (prvBalance < fee) {
      throw new Error(MESSAGES.NOT_ENOUGH_NETWORK_FEE_ADD);
    }

    return account;
  };

  const continueAdd = async () => {
    if (loading) {
      return;
    }

    try {
      setLoading(MESSAGES.ADD_LIQUIDITY_PROCESS);
      const { paymentAddress, token2, pairId, outputFee } = history;
      const account = await validate(paymentAddress, token2, pairId, outputFee);
      const res = await addToken(wallet, account, token2, token2.TokenAmount, pairId, outputFee);
      history.updateTx2(res);
      updateHistory(history);
      Toast.showSuccess(`${MESSAGES.ADD_LIQUIDITY_SUCCESS_TITLE}. ${MESSAGES.ADD_LIQUIDITY_SUCCESS}`);
    } catch (e) {
      Toast.showError(new ExHandler(e).getMessage());
    } finally {
      setLoading(null);
    }
  };

  const onCancelAdd = async () => {
    if (loading) {
      return;
    }

    try {
      setLoading(MESSAGES.CANCEL_LIQUIDITY_PROCESS);
      const { paymentAddress, token1, pairId, inputFee } = history;
      const account = await validate(paymentAddress, {...token1, TokenAmount: MIN_CANCEL_VALUE}, pairId, inputFee);
      const res = await addToken(wallet, account, token1, MIN_CANCEL_VALUE, pairId, inputFee);
      history.cancel(res);
      updateHistory(history);
      Toast.showSuccess(`${MESSAGES.CANCEL_ADD_LIQUIDITY_SUCCESS_TITLE}. ${MESSAGES.CANCEL_ADD_LIQUIDITY_SUCCESS}`);
    } catch (e) {
      Toast.showError(new ExHandler(e).getMessage());
    } finally {
      setLoading(null);
    }
  };

  const onDelete = () => {
    deleteHistory(history);
    navigation.goBack();
  };

  const onGetStatus = () => {
    getHistoryStatus(history);
  };

  return(
    <View style={stylesheet.flex}>
      <Header title="Transaction details" />
      <ScrollView style={stylesheet.scrollView}>
        <History
          {...history}
          onContinue={continueWithdraw}
          onAdd={continueAdd}
          onCancel={onCancelAdd}
          loading={loading}
        />
        <Overlay
          isVisible={!!loading}
          overlayStyle={stylesheet.modal}
          overlayBackgroundColor="transparent"
          windowBackgroundColor="rgba(0,0,0,0.8)"
        >
          <FullScreenLoading
            open={!!loading}
            mainText={loading}
          />
        </Overlay>
        <View style={stylesheet.row}>
          {!!global.isDEV && <Button style={stylesheet.delete} title="Delete" onPress={onDelete} />}
          {!!global.isDEV && <Button style={stylesheet.button} title="Refresh" onPress={onGetStatus} />}
        </View>
      </ScrollView>
    </View>
  );
};

const mapState = state => ({
  wallet: state.wallet,
});

const mapDispatch = {
  updateHistory,
  getHistoryStatus,
  deleteHistory,
};


DexHistoryDetail.propTypes = {
  wallet: PropTypes.object.isRequired,
  updateHistory: PropTypes.func.isRequired,
  getHistoryStatus: PropTypes.func.isRequired,
  deleteHistory: PropTypes.func.isRequired,
  navigation: PropTypes.shape({
    state: PropTypes.shape({
      params: PropTypes.shape({
        history: PropTypes.object.isRequired,
      }).isRequired,
    }).isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default connect(
  mapState,
  mapDispatch
)(withLayout_2(DexHistoryDetail));
