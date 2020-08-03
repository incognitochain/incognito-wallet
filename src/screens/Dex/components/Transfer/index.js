import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  Button,
  Image,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  BaseTextInput as TextInput,
} from '@src/components/core';
import {ScrollView, Keyboard, TouchableWithoutFeedback, VirtualizedList} from 'react-native';
import accountService from '@services/wallet/accountService';
import { isExchangeRatePToken } from '@src/services/wallet/RpcClientService';
import {CONSTANT_COMMONS, CONSTANT_EVENTS} from '@src/constants';
import convertUtil from '@utils/convert';
import formatUtil from '@utils/format';
import {ExHandler} from '@services/exception';
import {Icon, Overlay} from 'react-native-elements';
import {COLORS} from '@src/styles';
import accountIcon from '@src/assets/images/icons/account_icon.png';
import leftArrow from '@src/assets/images/icons/left_arrow.png';
import CryptoIcon from '@components/CryptoIcon';
import EstimateFee from '@components/EstimateFee';
import FullScreenLoading from '@components/FullScreenLoading';
import tokenService, {PRV} from '@services/wallet/tokenService';
import AddPin from '@screens/AddPIN';
import {DepositHistory, WithdrawHistory} from '@models/dexHistory';
import Toast from '@components/core/Toast/Toast';
import VerifiedText from '@components/VerifiedText/index';
import routeNames from '@routers/routeNames';
import TransferSuccessPopUp from '../TransferSuccessPopUp';
import {WAIT_TIME, MESSAGES, MIN_INPUT, MULTIPLY, MAX_WAITING_TIME, PRV_ID} from '../../constants';
import { mainStyle, modalStyle, tokenStyle } from '../../style';

const MAX_TRIED = MAX_WAITING_TIME / WAIT_TIME;

class Transfer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      transfer: {},
      filteredTokens: [],
      balances: [],
      sending: false,
    };
    this.renderTokenItem = this.renderTokenItem.bind(this);
  }

  componentDidMount() {
    this.handleSearch('');
  }

  componentDidUpdate(prevProps) {
    const { action, inputToken } = this.props;

    if (action && action !== prevProps.action) {
      if (inputToken && action === 'deposit') {
        this.selectToken(inputToken);
      }

      this.handleSearch('');
    }
  }

  updateTransfer(newTransfer, cb) {
    const { transfer } = this.state;
    this.setState({ transfer: {...transfer, ...newTransfer} }, cb);
  }

  checkCorrectBalance = (account, token, value) => {
    const { wallet } = this.props;
    let tried = 0;
    return async (resolve, reject) => {
      const balance = await accountService.getBalance(account, wallet, token.id);
      if (balance >= value) {
        clearInterval(this.interval);
        WithdrawHistory.currentWithdraw.checking = true;
        resolve(balance);
      }

      if (tried++ > MAX_TRIED) {
        reject(MESSAGES.SOMETHING_WRONG);
      }
    };
  };

  sendPToken = (fromAccount, toAccount, token, amount, paymentInfo, prvFee = 0, tokenFee = 0) => {
    const { wallet } = this.props;

    const tokenObject = {
      Privacy: true,
      TokenID: token.id,
      TokenName: token.name,
      TokenSymbol: token?.symbol,
      TokenTxType: CONSTANT_COMMONS.TOKEN_TX_TYPE.SEND,
      TokenAmount: amount,
      TokenReceivers: [{
        PaymentAddress: toAccount.PaymentAddress,
        Amount: amount
      }]
    };

    console.debug('SEND PTOKEN', paymentInfo, fromAccount.AccountName, toAccount.AccountName, amount, prvFee, tokenFee, tokenObject);

    return tokenService.createSendPToken(
      tokenObject,
      prvFee,
      fromAccount,
      wallet,
      paymentInfo,
      tokenFee,
    );
  };

  sendPRV = async (fromAccount, toAccount, amount, prvFee = 0) => {
    const { wallet } = this.props;

    const paymentInfos = [{
      paymentAddressStr: toAccount.PaymentAddress,
      amount: amount
    }];

    console.debug('SEND PRV', paymentInfos, fromAccount.AccountName, toAccount.AccountName, amount, prvFee);

    return accountService.createAndSendNativeToken(paymentInfos, prvFee, true, fromAccount, wallet);
  };

  waitUntil = (func, ms) => {
    return new Promise(async (resolve, reject) => {
      this.interval = setInterval(func.bind(this, resolve, reject), ms);
    });
  };

  async deposit({ token, amount, account, fee, feeUnit }) {
    const { dexMainAccount, onAddHistory } = this.props;
    let res;

    if (!token.id || token.id === PRV_ID) {
      res = await this.sendPRV(account, dexMainAccount, amount, fee);
    } else {
      res = await this.sendPToken(account, dexMainAccount, token, amount, null, feeUnit === PRV?.symbol ? fee : 0, feeUnit !== PRV?.symbol ? fee : 0);
    }
    onAddHistory(new DepositHistory(res, token, amount, fee, feeUnit, account));
  }

  async withdraw({ token, amount, account, fee: rawFee }) {
    const { dexMainAccount, dexWithdrawAccount, onAddHistory, onUpdateHistory, navigation } = this.props;
    const { waitUntil, sendPRV, sendPToken, checkCorrectBalance } = this;
    const fee = _.floor(rawFee / 2, 0);

    let newHistory;
    let res1;
    let res2;

    try {
      WithdrawHistory.withdrawing = true;
      if (!token.id || token.id === PRV_ID) {
        res1 = await sendPRV(dexMainAccount, dexWithdrawAccount, amount + fee, fee);
        newHistory = new WithdrawHistory(res1, token, amount, rawFee, PRV?.symbol, account);
        onAddHistory(newHistory);
        await waitUntil(checkCorrectBalance(dexWithdrawAccount, PRV, amount + fee), WAIT_TIME);
        res2 = await this.sendPRV(dexWithdrawAccount, account, amount, fee);
      } else {
        const {transfer} = this.state;
        const {feeUnit} = transfer;
        const paymentInfo = feeUnit === PRV?.symbol ? {
          paymentAddressStr: dexWithdrawAccount.PaymentAddress,
          amount: fee,
        } : null;
        const tokenFee = feeUnit !== PRV?.symbol ? fee : 0;
        res1 = await sendPToken(dexMainAccount, dexWithdrawAccount, token, amount + tokenFee, paymentInfo, tokenFee ? 0 : fee, tokenFee);
        newHistory = new WithdrawHistory(res1, token, amount, rawFee, feeUnit, account);
        onAddHistory(newHistory);
        await waitUntil(checkCorrectBalance(dexWithdrawAccount, token, amount + tokenFee), WAIT_TIME);
        res2 = await this.sendPToken(dexWithdrawAccount, account, token, amount, null, tokenFee ? 0 : fee, tokenFee);
      }

      newHistory.updateTx2(res2);
      WithdrawHistory.currentWithdraw = null;
      onUpdateHistory(newHistory);
      Toast.showSuccess(MESSAGES.WITHDRAW_COMPLETED);
    } catch (error) {
      WithdrawHistory.currentWithdraw = null;
      onUpdateHistory(newHistory);
      throw error;
    } finally {
      WithdrawHistory.withdrawing = false;
      if (AddPin.waiting) {
        navigation.navigate(routeNames.AddPin, {action: 'login'});
      }
    }
  }

  transfer = async () => {
    const { onLoadData, wallet, dexMainAccount } = this.props;
    const { transfer, sending } = this.state;
    const { action, error, token, amount, account, fee, feeUnit } = transfer;
    let prvBalance = 0;
    let prvFee = 0;
    let prvAccount = action === MESSAGES.DEPOSIT ? account : dexMainAccount;

    if (sending) {
      return;
    }

    if (!error && token && amount && account && !sending) {
      this.updateTransfer({ chainError: null });
      try {
        this.setState({ sending: true });
        if (token.id !== PRV_ID && feeUnit === PRV?.symbol) {
          prvBalance = await accountService.getBalance(prvAccount, wallet);
          prvBalance = await accountService.getBalance(prvAccount, wallet);
          prvFee = fee;
          if (prvFee > prvBalance) {
            return this.updateTransfer({chainError: MESSAGES.NOT_ENOUGH_NETWORK_FEE});
          }
        }
        await this[action](transfer);
        this.updateTransfer({ success: true });
        onLoadData();
      } catch (error) {
        this.updateTransfer({ chainError: new ExHandler(error).getMessage() });
      } finally {
        this.setState({ sending: false });
      }
    }
  };

  async getBalances(token) {
    const { accounts, wallet } = this.props;
    const balances = accounts.map(() => undefined);

    if (accounts.length === 1) {
      this.selectAccount(accounts[0]);
    } else {
      accounts.forEach((account, index) => {
        accountService.getBalance(account, wallet, token.id)
          .then(balance => {
            balances[index] = balance;
            this.setState({balances: [...balances]});
          });
      });
    }
  }

  selectAccount = (account, index) => {
    const { transfer, balances } = this.state;
    const { token } = transfer;
    const { wallet, dexMainAccount } = this.props;
    if (transfer.action === 'deposit') {
      if (index === undefined) {
        this.updateTransfer({ account }, () => {
          accountService.getBalance(account, wallet, token.id)
            .then(balance => {
              this.updateTransfer({ balance });
            });
        });
      } else if (balances[index] >= 0) {
        this.updateTransfer({
          account,
          balance: balances[index],
        });
      }
    } else {
      this.updateTransfer({ account }, () => {
        accountService.getBalance(dexMainAccount, wallet, token.id)
          .then(balance => {
            this.updateTransfer({ balance });
          });
      });
    }
  };

  selectToken = async (token) => {
    const { action, accounts } = this.props;
    const { transfer } = this.state;

    transfer.token = token;
    transfer.fee = null;
    transfer.feeUnit = null;
    transfer.action = action;
    this.updateTransfer({
      token,
      fee: null,
      feeUnit: null,
      action,
    }, this.getSupportedFeeTypes.bind(this, token));

    if (transfer.action === 'deposit') {
      this.getBalances(token);
    } else if (accounts.length === 1) {
      this.selectAccount(accounts[0]);
    }
  };

  closePopUp = () => {
    const { onClosePopUp } = this.props;
    this.setState({ transfer: {} });

    onClosePopUp();
  };

  closeAccountPopUp = () => {
    this.updateTransfer({
      token: undefined,
      fee: undefined,
      feeUnit: undefined,
    });
    this.setState({balances: []});
  };

  closeAmountPopUp = () => {
    this.updateTransfer({
      account: undefined,
      chainError: null,
      error: null,
      amount: 0,
    }, () => {
      const { accounts } = this.props;
      const { transfer } = this.state;
      if (accounts.length > 1) {
        this.selectToken(transfer.token);
      } else {
        this.closeAccountPopUp();
      }
    });
  };

  changeAmount = (text) => {
    const { transfer } = this.state;
    const number = convertUtil.toNumber(text);
    let amount = transfer.amount;
    let error;

    if (!_.isNaN(number)) {
      const { balance } = transfer;
      const originalAmount = convertUtil.toOriginalAmount(number, transfer.token.pDecimals, transfer.token.pDecimals !== 0);

      if (!Number.isInteger(originalAmount)) {
        amount = 0;
        error = MESSAGES.MUST_BE_INTEGER;
      } else if (originalAmount > balance) {
        amount = originalAmount;
        error = MESSAGES.BALANCE_INSUFFICIENT;
      } else if (originalAmount < MIN_INPUT) {
        error = `Please enter a number greater than or equal to ${formatUtil.amountFull(MIN_INPUT, transfer.token.pDecimals)}.`;
      } else {
        amount = originalAmount;
        error = null;
      }
    } else {
      error = 'Must be a number.';
    }

    this.updateTransfer({
      error,
      amount,
      chainError: null,
    });
  };

  getSupportedFeeTypes = async () => {
    const supportedFeeTypes = [{
      tokenId: CONSTANT_COMMONS.PRV_TOKEN_ID,
      symbol: CONSTANT_COMMONS.CRYPTO_SYMBOL.PRV
    }];

    try {
      const { transfer } = this.state;
      const { token } = transfer;
      const isUsed = await isExchangeRatePToken(token.id);
      isUsed && supportedFeeTypes.push({
        tokenId: token.id,
        symbol: token?.symbol
      });
    } finally {
      this.updateTransfer({ supportedFeeTypes });
    }
  };

  handleSelectFee = (estimateFeeData) => {
    const { transfer } = this.state;

    const { fee, feeUnit, feeUnitByTokenId } = estimateFeeData;
    let error = transfer.error;
    const { token, amount, balance } = transfer;
    const txFee = feeUnit === token?.symbol ? fee : 0;

    if (txFee + amount > balance) {
      error = MESSAGES.BALANCE_INSUFFICIENT;
    } else if (error === MESSAGES.BALANCE_INSUFFICIENT) {
      error = null;
    }

    this.updateTransfer({
      fee,
      feeUnit,
      feeUnitByTokenId,
      multiply: transfer.action === 'deposit' ? 2 : MULTIPLY,
      error,
      chainError : null,
    });
  };

  handleSearch = (text) => {
    const { tokens } = this.props;
    const searchText = text.toLowerCase();
    const filteredTokens = _.trim(searchText).length > 0 ? (tokens || [])
      .filter(token =>
        token?.name?.toLowerCase?.().includes(_.trim(searchText)) ||
        token?.symbol?.toLowerCase?.().includes(_.trim(searchText))
      ) : tokens;
    this.setState({ filteredTokens });
  };

  renderAccountBalance(token, index) {
    const { transfer, balances } = this.state;

    if (transfer.action === 'withdraw') {
      return null;
    }

    if (balances[index] === undefined) {
      return <ActivityIndicator size="small" style={mainStyle.textRight} />;
    }

    return  (
      <View style={[mainStyle.twoColumns, mainStyle.textRight]}>
        <Text
          style={[tokenStyle.name, tokenStyle.modalName, mainStyle.textRight, mainStyle.accountBalance]}
          numberOfLines={1}
        >
          {formatUtil.amount(balances[index], token?.pDecimals)}
        </Text>
        <Text style={[tokenStyle.name, tokenStyle.modalName, mainStyle.textRight, mainStyle.accountBalance]}>
          &nbsp;{token?.symbol}
        </Text>
      </View>
    );
  }

  renderAccountPopUp() {
    const { transfer } = this.state;
    const { accounts } = this.props;
    const { account, token } = transfer;

    return (
      <Overlay isVisible={!account && !!token} overlayStyle={mainStyle.modal}>
        {!account && !!token && (
          <View>
            <View style={mainStyle.modalHeader}>
              <TouchableOpacity onPress={this.closeAccountPopUp} style={mainStyle.modalBack}>
                <Image source={leftArrow} />
              </TouchableOpacity>
              <Text style={mainStyle.modalHeaderText}>
                {transfer.action === 'deposit' ? 'Deposit from' : 'Withdraw to'}
              </Text>
              <TouchableOpacity onPress={this.closePopUp}>
                <Icon name="close" color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <ScrollView style={mainStyle.modalContent}>
              {accounts.map((item, index) => (
                <TouchableOpacity
                  key={item.AccountName}
                  onPress={this.selectAccount.bind(this, item, index)}
                  style={[mainStyle.modalItem, index === accounts.length - 1 && mainStyle.lastItem]}
                  activeOpacity={0.5}
                >
                  <Image source={accountIcon} style={mainStyle.accountIcon} />
                  <Text numberOfLines={1} style={mainStyle.accountName}>{item.AccountName}</Text>
                  {this.renderAccountBalance(token, index)}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </Overlay>
    );
  }

  renderTokenItem({ item, index }) {
    const { filteredTokens } = this.state;
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => this.selectToken(item)}
        activeOpacity={0.5}
        style={[mainStyle.modalItem, index === filteredTokens.length - 1 && mainStyle.lastItem]}
      >
        <CryptoIcon tokenId={item.id} size={25} />
        <View style={[mainStyle.twoColumns, mainStyle.flex]}>
          <View style={modalStyle.tokenInfo}>
            <VerifiedText text={item.displayName} style={modalStyle.tokenSymbol} isVerified={item.isVerified} />
            <Text style={modalStyle.tokenName}>{item.name}</Text>
          </View>
          <Text style={[modalStyle.tokenSymbol, mainStyle.textRight]}>{item?.symbol}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  renderTokenPopup() {
    const { transfer, filteredTokens } = this.state;
    const { action } = this.props;
    const { token } = transfer;

    return (
      <Overlay isVisible={!!action && !token} overlayStyle={mainStyle.modal}>
        {!!action && !token && (
          <View>
            <View style={mainStyle.modalHeader}>
              <Text style={mainStyle.modalHeaderText}>Select a coin</Text>
              <TouchableOpacity onPress={this.closePopUp}>
                <Icon name="close" color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <View>
              <TextInput
                placeholder="Search"
                style={[modalStyle.search, modalStyle.transferSearch]}
                onChangeText={this.handleSearch}
              />
            </View>
            <VirtualizedList
              data={filteredTokens}
              renderItem={this.renderTokenItem}
              getItem={(data, index) => data[index]}
              getItemCount={data => data.length}
              style={modalStyle.container}
            />
          </View>
        )}
      </Overlay>
    );
  }

  renderAmountPopup() {
    const { transfer, sending } = this.state;
    const { dexMainAccount, dexWithdrawAccount, onSelectPrivacyByTokenID } = this.props;
    const {
      token,
      balance,
      amount,
      action,
      success,
      supportedFeeTypes,
      fee,
      feeUnit,
      feeUnitByTokenId,
      account,
      multiply,
      chainError,
    } = transfer;
    let { error } = transfer;

    if (!error && _.isNumber(fee) && !_.isNaN(fee) && amount > balance) {
      error = MESSAGES.BALANCE_INSUFFICIENT;
    }

    const isVisible = !!account && !success;

    return (
      <Overlay
        isVisible={isVisible}
        overlayStyle={[mainStyle.modal, sending && mainStyle.hiddenDialog]}
        overlayBackgroundColor={sending ? 'transparent' : 'white'}
        windowBackgroundColor={`rgba(0,0,0,${ sending ? 0.8 : 0.5})`}
        onBackdropPress={Keyboard.dismiss}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            <View style={sending && mainStyle.hidden}>
              <View style={mainStyle.modalHeader}>
                <TouchableOpacity onPress={this.closeAmountPopUp} style={mainStyle.modalBack}>
                  <Image source={leftArrow} />
                </TouchableOpacity>
                <Text style={[mainStyle.modalHeaderText]}>
                  Amount
                </Text>
                <TouchableOpacity onPress={this.closePopUp}>
                  <Icon name="close" color={COLORS.white} />
                </TouchableOpacity>
              </View>
              <View style={[mainStyle.paddingTop, mainStyle.longContent]}>
                <View style={[mainStyle.twoColumns, mainStyle.center, tokenStyle.wrapper, mainStyle.padding]}>
                  <Text style={tokenStyle.name}>{action === 'deposit' ? 'Deposit from' : 'Withdraw to'}:</Text>
                  <Text style={[mainStyle.textRight, mainStyle.longAccountName]} numberOfLines={1}>
                    {transfer?.account?.AccountName}
                  </Text>
                </View>
                <View style={[mainStyle.twoColumns, mainStyle.center, tokenStyle.wrapper, mainStyle.padding]}>
                  <Text style={tokenStyle.name}>Balance:</Text>
                  <View style={[mainStyle.textRight, mainStyle.twoColumns]}>
                    { _.isNumber(balance) ?
                      (
                        <Text
                          style={[tokenStyle.symbol, mainStyle.longAccountName]}
                          numberOfLines={1}
                        >
                          {formatUtil.amountFull(balance, token?.pDecimals)}
                        </Text>
                      ) : <ActivityIndicator size="small" style={mainStyle.textRight} />
                    }
                    <Text>&nbsp;{token?.symbol}</Text>
                  </View>
                </View>
                <TextInput
                  style={tokenStyle.input}
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                  onChangeText={this.changeAmount}
                  editable={_.isNumber(balance)}
                />
                {!!error && <Text style={[mainStyle.fee, mainStyle.error, mainStyle.center, tokenStyle.error]}>{error}</Text>}
                {!!chainError && <Text style={[mainStyle.fee, mainStyle.error, mainStyle.center, tokenStyle.error]}>{chainError}</Text>}
                {isVisible && (
                  <View style={mainStyle.modalEstimate}>
                    <EstimateFee
                      accountName={action === 'deposit' ? account?.AccountName : dexMainAccount?.AccountName}
                      estimateFeeData={{feeUnit, fee, feeUnitByTokenId}}
                      onNewFeeData={this.handleSelectFee}
                      types={supportedFeeTypes}
                      dexToken={token}
                      selectedPrivacy={onSelectPrivacyByTokenID(token?.id)}
                      dexBalance={balance}
                      amount={amount <= balance ? amount / Math.pow(10, token?.pDecimals || 0) : null}
                      toAddress={action === 'deposit' ? dexMainAccount?.PaymentAddress : dexWithdrawAccount?.PaymentAddress}
                      multiply={multiply || 2}
                    />
                  </View>
                )}
                <Button
                  title={_.capitalize(action)}
                  disabled={
                    sending ||
                    error ||
                    !_.isNumber(amount) ||
                    !_.isNumber(fee) ||
                    !_.isNumber(balance)
                  }
                  style={tokenStyle.button}
                  onPress={this.transfer}
                />
              </View>
            </View>
            <FullScreenLoading
              open={sending}
              mainText={action === 'withdraw' ? MESSAGES.WITHDRAW_PROCESS : ''}
            />
          </View>
        </TouchableWithoutFeedback>
      </Overlay>
    );
  }

  render() {
    const { transfer } = this.state;
    const { success, account, token, action, amount } = transfer;
    return (
      <View>
        {this.renderAccountPopUp()}
        {this.renderTokenPopup()}
        {this.renderAmountPopup()}
        <TransferSuccessPopUp
          account={account}
          action={action}
          token={token}
          amount={amount}
          success={success}
          closePopUp={this.closePopUp}
        />
      </View>
    );
  }
}

Transfer.defaultProps = {
  action: '',
  inputToken: null,
  dexWithdrawAccount: {},
  dexMainAccount: {},
};

Transfer.propTypes = {
  dexMainAccount: PropTypes.object,
  dexWithdrawAccount: PropTypes.object,
  onAddHistory: PropTypes.func.isRequired,
  onUpdateHistory: PropTypes.func.isRequired,
  wallet: PropTypes.object.isRequired,
  tokens: PropTypes.array.isRequired,
  accounts: PropTypes.array.isRequired,
  action: PropTypes.string,
  inputToken: PropTypes.object,
  onClosePopUp: PropTypes.func.isRequired,
  onLoadData: PropTypes.func.isRequired,
  onSelectPrivacyByTokenID: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
};

export default Transfer;
