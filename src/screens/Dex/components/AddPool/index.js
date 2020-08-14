import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Button, Image, Text, View, Toast } from '@src/components/core';
import accountService from '@services/wallet/accountService';
import convertUtil from '@utils/convert';
import { Divider } from 'react-native-elements';
import ExchangeRate from '@screens/Dex/components/ExchangeRate';
import PoolSize from '@screens/Dex/components/PoolSize';
import {
  getEstimateFeeForNativeToken,
  getEstimateFeeForPToken,
  getTransactionByHash
} from '@services/wallet/RpcClientService';
import { PRV } from '@services/wallet/tokenService';
import dexUtils from '@utils/dex';
import { AddLiquidityHistory } from '@models/dexHistory';
import addLiquidityIcon from '@src/assets/images/icons/add_liquidity.png';
import { CONSTANT_COMMONS } from '@src/constants';
import NetworkFee from '@screens/Dex/components/NetworkFee';
import AddSuccessDialog from '@screens/Dex/components/AddSuccessDialog';
import CODE from '@src/services/exception/customError/code';
import { ExHandler } from '@services/exception';
import { MAX_FEE_PER_TX } from '@components/EstimateFee/EstimateFee.utils';
import Input from '../Input';
import Loading from '../Loading';
import { DEX_CHAIN_ACCOUNT, MESSAGES, MIN_INPUT, PRV_ID, SECOND } from '../../constants';
import { mainStyle } from '../../style';

class Pool extends React.Component {
  constructor(props) {
    super(props);
    this.state = props.params;

    this.estimateInputFee = _.debounce(this.estimateInputFee.bind(this), 100);
    this.estimateOutputFee = _.debounce(this.estimateOutputFee.bind(this), 100);
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps, prevState) {
    const { pairs, tokens, onUpdateParams } = this.props;

    if (tokens.length > 0 && (pairs !== prevProps.pairs || tokens !== prevProps.tokens)) {
      this.loadData();
    }

    if (this.state !== prevState) {
      onUpdateParams(this.state);
    }

    const { inputBalance, outputBalance, inputFee, outputFee, inputToken, outputToken } = this.state;

    if (inputBalance > prevState.inputBalance || (inputBalance && (!inputFee || inputToken !== prevState.inputToken))) {
      this.estimateInputFee();
    }

    if (outputBalance > prevState.outputBalance || (outputBalance && (!outputFee || outputToken !== prevState.outputToken))) {
      this.estimateOutputFee();
    }
  }

  async estimateFee() {
    return MAX_FEE_PER_TX;
  }

  async loadData() {
    const { tokens, wallet, account } = this.props;
    const { inputToken, outputToken } = this.state;

    accountService.getBalance(account, wallet)
      .then(balance => this.setState({ prvBalance: balance }));

    if (!tokens || tokens.length <= 0) {
      return;
    }

    if (inputToken && outputToken) {
      this.filterList();
      this.getInputBalance();
      this.getOutputBalance();
    } else {
      this.selectInput(tokens[0]);
    }
  }

  estimateInputFee = async () => {
    const { inputToken, inputBalance } = this.state;
    const fee = await this.estimateFee(inputToken, inputBalance);
    this.setState({ inputFee: fee });
  };

  estimateOutputFee = async () => {
    const { outputToken, outputBalance } = this.state;
    const fee = await this.estimateFee(outputToken, outputBalance);
    this.setState({ outputFee: fee });
  };

  async getBalance(token, valueKey) {
    const { wallet, account } = this.props;
    const balance = await accountService.getBalance(account, wallet, token.id);
    let error;

    if (token !== token || !token) {
      return;
    }

    const { [valueKey]: value } = this.state;
    error = this.parseText(value, token, balance).error;

    return { balance, error };
  }

  async getInputBalance() {
    const { inputToken: token, inputBalance: prevBalance } = this.state;
    try {
      const data = await this.getBalance(token, 'rawText', prevBalance);

      if (!data) {
        return;
      }

      const { balance, error } = data;
      this.setState({ inputBalance: balance, inputError: error });
    } catch (error) {
      console.debug('GET INPUT BALANCE ERROR', error);
    }
  }

  async getOutputBalance() {
    const { outputToken: token, outputBalance: prevBalance } = this.state;
    try {
      const data = await this.getBalance(token, 'outputText', prevBalance);

      if (!data) {
        return;
      }

      const { balance, error } = data;
      this.setState({ outputBalance: balance, outputError: error });
    } catch (error) {
      console.debug('GET OUTPUT BALANCE ERROR', error);
    }
  }

  selectInput = (inputToken) => {
    const { outputToken } = this.state;

    this.setState({
      inputToken,
      inputValue: convertUtil.toOriginalAmount(1, inputToken.pDecimals),
      outputToken: outputToken === inputToken ? null : outputToken,
      rawText: '1',
      inputError: null,
      inputBalance: 'Loading',
    }, async () => {
      this.filterList();
      this.getInputBalance();
    });
  };

  selectOutput = (outputToken) => {
    this.setState({
      outputToken: outputToken,
      outputValue: convertUtil.toOriginalAmount(1, outputToken.pDecimals),
      outputText: '1',
      outputError: null,
      outputBalance: 'Loading',
    }, async () => {
      this.filterList();
      this.getOutputBalance();
    });
  };

  parseText(text, token, balance) {
    let number = convertUtil.toNumber(text);
    let value = 0;
    let error;

    if (!text || text.length === 0) {
      error = null;
    } else if (_.isNaN(number)) {
      error = MESSAGES.MUST_BE_NUMBER;
    } else {
      number = convertUtil.toOriginalAmount(number, token.pDecimals, token.pDecimals !== 0);
      value = number;
      if (number < MIN_INPUT) {
        error = MESSAGES.GREATER_OR_EQUAL(MIN_INPUT, token.pDecimals);
        value = 0;
      } else if (!Number.isInteger(number)) {
        error = MESSAGES.MUST_BE_INTEGER;
        value = 0;
      } else if (number > balance) {
        error = MESSAGES.BALANCE_INSUFFICIENT;
      }
    }

    return { value, error, text: text ? text.toString() : '' };
  }

  changeInputValue = (newValue) => {
    const { inputBalance, inputToken } = this.state;
    const { value, error, text } = this.parseText(newValue, inputToken, inputBalance);
    this.setState({
      rawText: text,
      inputValue: value,
      inputError: error,
    }, this.calculateOutputValue);
  };

  changeOutputValue = (newValue) => {
    const { outputBalance, outputToken } = this.state;
    const { text, value, error } = this.parseText(newValue, outputToken, outputBalance);
    this.setState({
      outputText: text,
      outputValue: value,
      outputError: error,
    }, this.calculateInputValue);
  };

  filterList() {
    let { inputToken, outputToken: currentOutputToken } = this.state;
    const { tokens, pairs } = this.props;

    const inputList = _(tokens)
      .value();
    inputToken = inputToken || inputList[0];

    const outputList = _(inputList)
      .filter(item => item.id !== inputToken?.id)
      .value();
    const outputToken = currentOutputToken && outputList.find(item => item.id === currentOutputToken.id) ? currentOutputToken : outputList[0];
    const pair = inputToken && outputToken ?
      pairs.find(i => Object.keys(i).includes(outputToken.id) && Object.keys(i).includes(inputToken.id))
      : null;

    this.setState({
      inputToken,
      outputToken,
      pair,
      inputList,
      outputList,
    }, () => {
      this.calculateOutputValue();
      if (currentOutputToken !== outputToken) {
        this.getOutputBalance();
      }
    });
  }

  calculateInputValue() {
    const { pair } = this.state;

    if (!pair) {
      return;
    }

    try {
      const { outputToken, inputToken, outputValue, inputBalance } = this.state;
      const data = dexUtils.calculateValue(outputToken, outputValue, inputToken, pair);
      const { outputValue: output, outputText: text } = data;
      const { error } = this.parseText(text, inputToken, inputBalance);

      this.setState({ inputValue: output, rawText: text, pair, inputError: error });
    } catch (error) {
      console.debug('CALCULATE INPUT ERROR', error);
    }
  }

  calculateOutputValue() {
    const { pair } = this.state;

    if (!pair) {
      return;
    }

    try {
      const { outputToken, inputToken, inputValue, outputBalance } = this.state;
      const data = dexUtils.calculateValue(inputToken, inputValue, outputToken, pair);
      const { outputValue, outputText } = data;
      const { error } = this.parseText(outputText, outputToken, outputBalance);

      this.setState({ outputValue, outputText, outputError: error });
    } catch (error) {
      console.debug('CALCULATE OUTPUT ERROR', error);
    }
  }

  createTokenParams(token, amount) {
    return {
      Privacy: true,
      TokenID: token.id,
      TokenName: token.name,
      TokenSymbol: token?.symbol,
      TokenAmount: amount,
      TokenFee: 0,
      PDecimals: token.pDecimals,
    };
  }

  addToken = (token, value, pairId, fee) => {
    const { wallet, account } = this.props;
    if (token.id === PRV_ID) {
      return accountService.createAndSendTxWithNativeTokenContribution(wallet, account, fee, pairId, value);
    } else {
      const tokenParams = this.createTokenParams(token);
      return accountService.createAndSendPTokenContributionTx(wallet, account, tokenParams, fee, 0, pairId, value);
    }
  };

  waitTxComplete = (txId) => {
    clearInterval(this.interval);
    return new Promise((resolve, reject) => {
      this.interval = setInterval(async () => {
        const res = await getTransactionByHash(txId);
        if (res.isInBlock) {
          resolve();
        } else if (res.err) {
          reject(MESSAGES.TX_REJECTED);
        }
      }, 30 * SECOND);
    });
  };

  validateFee() {
    const { inputToken, inputValue, outputToken, outputValue, inputFee, outputFee, prvBalance } = this.state;
    let total = inputFee + outputFee;

    if (inputToken?.id === PRV.id) {
      total += inputValue;
    }

    if (outputToken?.id === PRV.id) {
      total += outputValue;
    }

    if (total > prvBalance) {
      const error = new Error();
      error.code = CODE.NOT_ENOUGH_NETWORK_FEE_ADD;
      throw error;
    }
  }

  closeSuccess = () => {
    this.setState({ showSuccess: false });
  };

  add = async () => {
    const { account, onAddHistory, onUpdateHistory, onUpdateParams } = this.props;
    const { inputToken, inputValue, outputToken, outputValue, inputFee, outputFee, adding } = this.state;
    const pa = account.PaymentAddress;
    const timestamp = new Date().getTime().toString();
    const pairId = `${pa.slice(0, 6)}-${inputToken?.symbol}-${outputToken?.symbol}-${timestamp}`;
    let newHistory;

    console.debug('ADD LIQUIDITY', inputFee, outputFee, inputValue, outputValue, pairId);

    if (adding) {
      return;
    }

    try {
      this.setState({ adding: true });
      this.validateFee();
      const res = await this.addToken(inputToken, inputValue, pairId, inputFee);
      const inputParams = this.createTokenParams(inputToken, inputValue);
      const outputParams = this.createTokenParams(outputToken, outputValue);
      newHistory = new AddLiquidityHistory(res, pairId, inputParams, outputParams, inputFee, outputFee, account);
      AddLiquidityHistory.currentHistory = newHistory;
      onAddHistory(newHistory);
      const txId = res.txId;
      await this.waitTxComplete(txId);
      const res2 = await this.addToken(outputToken, outputValue, pairId, outputFee);
      newHistory.updateTx2(res2);
      this.setState({ showSuccess: true });
    } catch (error) {
      Toast.showError(new ExHandler(error).getMessage(MESSAGES.TRADE_ERROR));
    } finally {
      if (newHistory) {
        newHistory.status = undefined;
        AddLiquidityHistory.currentHistory = null;
        onUpdateHistory(newHistory);
      }
      this.setState({ adding: false }, () => {
        onUpdateParams(this.state);
      });
    }
  };

  renderFee() {
    const {
      inputToken,
      inputValue,
      outputToken,
      outputValue,
      pair,
      inputFee,
      outputFee,
      inputError,
      outputError,
    } = this.state;

    return (
      <View style={mainStyle.feeWrapper}>
        {!!pair && (
          <>
            <ExchangeRate
              inputToken={inputToken}
              inputValue={inputValue}
              outputToken={outputToken}
              outputValue={outputValue}
            />
            <PoolSize
              inputToken={inputToken}
              pair={pair}
              outputToken={outputToken}
            />
          </>
        )}
        {!inputError && !outputError && !!inputValue && !!outputValue && <NetworkFee fee={inputFee && outputFee ? inputFee + outputFee : null} />}
      </View>
    );
  }

  renderInputs() {
    const { wallet, account, isLoading } = this.props;
    const {
      inputToken,
      outputToken,
      outputText,
      inputError,
      outputError,
      rawText,
      pair,
      inputList,
      outputList,
      inputBalance,
      outputBalance,
    } = this.state;
    return (
      <View>
        <Input
          tokenList={inputList}
          onSelectToken={this.selectInput}
          onChange={this.changeInputValue}
          headerTitle="Deposit"
          token={inputToken}
          value={rawText}
          account={account}
          wallet={wallet}
          pool={!!pair && !!inputToken && pair[inputToken.id]}
          disabled={isLoading}
          balance={inputBalance}
          readOnly
        />
        {!!inputError && (
          <Text style={mainStyle.error}>
            {inputError}
          </Text>
        )}
        <View style={mainStyle.arrowWrapper}>
          <Divider style={mainStyle.divider} />
          <Image source={addLiquidityIcon} style={mainStyle.arrow} />
          <Divider style={mainStyle.divider} />
        </View>
        <Input
          tokenList={outputList}
          onSelectToken={this.selectOutput}
          onChange={this.changeOutputValue}
          headerTitle="Deposit"
          token={outputToken}
          account={account}
          wallet={wallet}
          value={outputText}
          pool={!!pair && !!outputToken && pair[outputToken.id]}
          balance={outputBalance}
        />
        {!!outputError && (
          <Text style={mainStyle.error}>
            {outputError}
          </Text>
        )}
      </View>
    );
  }

  render() {
    const { isLoading } = this.props;
    const {
      inputValue,
      inputError,
      outputValue,
      outputError,
      inputFee,
      outputFee,
      adding,
      showSuccess,
      inputToken,
      outputToken,
    } = this.state;

    return (
      <View style={mainStyle.componentWrapper}>
        <View>
          <View style={mainStyle.content}>
            {this.renderInputs()}
            {/*<View style={mainStyle.dottedDivider} />*/}
            {this.renderFee()}
            <View style={[mainStyle.actionsWrapper]}>
              <Button
                title="Add liquidity"
                style={[mainStyle.button]}
                disabled={
                  adding ||
                  !inputValue ||
                  inputValue <= 0 ||
                  inputError ||
                  !outputValue ||
                  outputValue <= 0 ||
                  outputError ||
                  !inputFee ||
                  !outputFee ||
                  isLoading
                }
                disabledStyle={mainStyle.disabledButton}
                onPress={this.add}
              />
            </View>
          </View>
        </View>
        <Loading open={!!adding} />
        <AddSuccessDialog
          show={showSuccess}
          inputToken={inputToken}
          inputValue={inputValue}
          outputToken={outputToken}
          outputValue={outputValue}
          closeSuccessDialog={this.closeSuccess}
        />
      </View>
    );
  }
}

Pool.propTypes = {
  wallet: PropTypes.object.isRequired,
  onUpdateParams: PropTypes.func.isRequired,
  onAddHistory: PropTypes.func.isRequired,
  onUpdateHistory: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired,
  pairs: PropTypes.array.isRequired,
  tokens: PropTypes.array.isRequired,
  params: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default Pool;
