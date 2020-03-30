import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Overlay} from 'react-native-elements';
import {Button, ScrollView, View} from '@components/core';
import FullScreenLoading from '@components/FullScreenLoading/index';
import {MAX_WAITING_TIME, MESSAGES, SHORT_WAIT_TIME, WAIT_TIME} from '@screens/Uniswap/constants';
import {CONSTANT_COMMONS} from '@src/constants';
import tokenService, {PRV} from '@services/wallet/tokenService';
import accountService from '@services/wallet/accountService';
import Toast from '@components/core/Toast/Toast';
import {DEX} from '@utils/dex';
import {deleteHistory, getHistoryStatus, updateHistory} from '@src/redux/actions/uniswap';
import {connect} from 'react-redux';
import {ExHandler} from '@services/exception';
import AddPin from '@screens/AddPIN';
import routeNames from '@routers/routeNames';
import {DepositHistory as DepositHistoryModel, WithdrawHistory as WithdrawHistoryModel,} from '@models/uniswapHistory';
import {depositToSmartContract, submitBurnProof} from '@services/trading';
import TradeHistory from './TradeHistory';
import WithdrawHistory from './WithdrawHistory';
import DepositHistory from './DepositHistory';
import stylesheet from './style';
import WithdrawSC from './WithdrawSC';

const MAX_TRIED = MAX_WAITING_TIME / SHORT_WAIT_TIME;

const HISTORY_TYPES = {
  [MESSAGES.DEPOSIT]: DepositHistory,
  [MESSAGES.WITHDRAW]: WithdrawHistory,
  [MESSAGES.TRADE]: TradeHistory,
  [MESSAGES.WITHDRAW_SC]: WithdrawSC
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

const waitUntil = (func, ms) => {
  return new Promise((resolve, reject) => {
    currentInterval = setInterval(func.bind(this, resolve, reject), ms);
  });
};

const checkCorrectBalance = (wallet, account, token, value) => {
  let tried = 0;
  return async (resolve, reject) => {
    const balance = await accountService.getBalance(account, wallet, token.id);
    console.debug('BALANCE', balance, value);
    if (balance >= value) {
      clearInterval(currentInterval);
      return resolve(balance);
    }

    if (tried++ > MAX_TRIED) {
      reject(MESSAGES.SOMETHING_WRONG);
    }
  };
};

const DexHistoryDetail = ({ navigation, wallet, updateHistory, getHistoryStatus, deleteHistory }) => {
  const { params } = navigation.state;
  const { history } = params;
  const [loading, setLoading] = React.useState(false);
  const History = HISTORY_TYPES[history.type];

  const continueDeposit = async () => {
    if (loading) {
      return;
    }

    try {
      DepositHistoryModel.currentDeposit = history;
      setLoading(MESSAGES.PROCESS);
      const accounts = await wallet.listAccount();
      const dexMainAccount = accounts.find(item => item.AccountName === DEX.MAIN_ACCOUNT);
      const {networkFee, networkFeeUnit, tokenId, amount, burnTxId} = history;
      const scAddress = await accountService.generateIncognitoContractAddress(wallet, dexMainAccount);

      const prvFee = networkFeeUnit === PRV.symbol ? networkFee : 0;
      const tokenFee = networkFeeUnit !== PRV.symbol ? networkFee : 0;
      const token = {id: tokenId};
      let burnRes;

      if (!burnTxId) {

        await waitUntil(checkCorrectBalance(wallet, dexMainAccount, token, amount + networkFee), WAIT_TIME);

        burnRes = await depositToSmartContract({
          token,
          amount,
          prvFee,
          tokenFee,
          wallet,
          dexMainAccount,
          scAddress,
        });

        history.burnTxId = burnRes.txId;
        updateHistory(history);
      }

      history.dbId = await submitBurnProof({
        paymentAddress: scAddress,
        walletAddress: dexMainAccount.PaymentAddress,
        tokenId: token?.id,
        burningTxId: burnTxId || burnRes.txId,
      });
      updateHistory(history);

      Toast.showSuccess(MESSAGES.DEPOSIT_SUCCESS);
    } catch (error) {
      updateHistory(history);
      Toast.showError(new ExHandler(error).getMessage());
    } finally {
      if (DepositHistoryModel.currentDeposit) {
        getHistoryStatus(DepositHistory.currentDeposit);
      }
      DepositHistoryModel.currentDeposit = null;
      setLoading('');
    }
  };

  const continueWithdraw = async () => {
    if (loading) {
      return;
    }

    try {
      WithdrawHistoryModel.withdrawing = true;
      setLoading(MESSAGES.WITHDRAW_PROCESS);
      const accounts = await wallet.listAccount();
      const dexWithdrawAccount = accounts.find(item => item.AccountName === DEX.WITHDRAW_ACCOUNT);
      const { tokenId, amount, networkFee, networkFeeUnit, pDecimals, paymentAddress, account: accountName, tokenSymbol, tokenName } = history;
      const token = { id: tokenId, symbol: tokenSymbol, pDecimals, name: tokenName || '' };
      const account = { AccountName: accountName, PaymentAddress: paymentAddress };
      const fee = _.floor(networkFee / 2, 0);

      const tokenFee = networkFeeUnit !== PRV.symbol ? fee : 0;
      await waitUntil(checkCorrectBalance(wallet, dexWithdrawAccount, token, amount + tokenFee), SHORT_WAIT_TIME);
      const res = await sendPToken(wallet, dexWithdrawAccount, account, token, amount, null, tokenFee ? 0 : fee, tokenFee);

      history.updateTx2(res);
      updateHistory(history);
      await getHistoryStatus(history);
      Toast.showSuccess(MESSAGES.WITHDRAW_COMPLETED);
    } catch (error) {
      updateHistory(history);
      Toast.showError(new ExHandler(error).getMessage());
    } finally {
      WithdrawHistoryModel.withdrawing = false;
      setLoading('');
      if (AddPin.waiting) {
        navigation.navigate(routeNames.AddPin, {action: 'login'});
      }
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
    <View>
      <ScrollView style={stylesheet.scrollView}>
        <History
          {...history}
          onContinue={continueWithdraw}
          onDeposit={continueDeposit}
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
)(DexHistoryDetail);
