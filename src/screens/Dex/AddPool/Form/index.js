import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Image, Text, View, RoundCornerButton } from '@components/core/index';
import accountService from '@services/wallet/accountService';
import convertUtil from '@utils/convert';
import { Divider } from 'react-native-elements';
import ExchangeRate from '@screens/Dex/ExchangeRate';
import PoolSize from '@screens/Dex/PoolSize';
import dexUtils from '@utils/dex';
import addLiquidityIcon from '@assets/images/icons/add_liquidity.png';
import NewInput from '@screens/DexV2/components/NewInput';
import Balance from '@screens/DexV2/components/Balance';
import routeNames from '@routers/routeNames';
import formatUtils from '@utils/format';
import { MAX_FEE_PER_TX } from '@components/EstimateFee/EstimateFee.utils';
import { ExHandler } from '@services/exception';
import { mainStyle } from '../../Home/style';
import { MESSAGES, MIN_INPUT } from '../../constants';

class Pool extends React.Component {
  constructor(props) {
    super(props);
    this.state = props.params;
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
  }

  async loadData() {
    const { tokens } = this.props;
    const { inputToken, outputToken } = this.state;
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
      this.setState({ inputBalance: balance, inputError: error, prvBalance: balance });
    } catch (error) {
      this.setState({ inputBalance: 0 });
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
      this.setState({ outputBalance: 0 });
      console.debug('GET OUTPUT BALANCE ERROR', error);
    }
  }

  selectInput = (inputToken) => {
    const { outputToken } = this.state;

    this.setState({
      inputToken,
      inputValue: 0,
      outputToken: outputToken === inputToken ? null : outputToken,
      rawText: '',
      inputError: null,
      inputBalance: null,
    }, async () => {
      this.filterList();
      this.getInputBalance();
    });
  };

  selectOutput = (outputToken) => {
    this.setState({
      outputToken: outputToken,
      outputValue: 0,
      outputText: '',
      outputError: null,
      outputBalance: null,
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
      const { outputToken, inputToken, inputValue, outputBalance, rawText } = this.state;

      if (rawText) {
        const data = dexUtils.calculateValue(inputToken, inputValue, outputToken, pair);
        const {outputValue, outputText} = data;
        const {error} = this.parseText(outputText, outputToken, outputBalance);
        this.setState({ outputValue, outputText, outputError: error });
      } else {
        this.setState({ outputValue: 0, outputText: '', outputError: '' });
      }
    } catch (error) {
      console.debug('CALCULATE OUTPUT ERROR', error);
    }
  }

  add = async () => {
    const { navigation } = this.props;
    const {
      inputToken,
      inputValue,
      outputToken,
      outputValue,
      prvBalance,
      pair,
      inputBalance,
      outputBalance,
    } = this.state;

    // const inputPool = pair[inputToken.id];
    // const share = formatUtils.toFixed(inputValue / inputPool * 100, 4);

    if (MAX_FEE_PER_TX + inputValue > prvBalance) {
      return this.setState({ inputError: MESSAGES.NOT_ENOUGH_PRV_NETWORK_FEE });
    }

    navigation.navigate(routeNames.AddLiquidityConfirm, {
      firstCoin: {
        ...inputToken,
        value: inputValue,
        displayValue: formatUtils.amountFull(inputValue, inputToken.pDecimals),
        balance: inputBalance,
      },
      secondCoin: {
        ...outputToken,
        value: outputValue,
        displayValue: formatUtils.amountFull(outputValue, outputToken.pDecimals),
        balance: outputBalance,
      },
      prvBalance,
      // share,
      pair,
    });
  };

  renderFee() {
    const {
      inputToken,
      inputValue,
      outputToken,
      outputValue,
      pair,
      inputBalance,
      outputBalance,
    } = this.state;

    if (!inputToken || !outputToken) {
      return null;
    }

    return (
      <View style={mainStyle.feeWrapper}>
        <Balance
          token={inputToken}
          balance={inputBalance}
        />
        <Balance
          token={outputToken}
          balance={outputBalance}
        />
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
      </View>
    );
  }

  renderInputs() {
    const {
      inputToken,
      outputToken,
      outputText,
      inputError,
      outputError,
      rawText,
      inputList,
      outputList,
      inputBalance,
    } = this.state;
    return (
      <View>
        <NewInput
          tokens={inputList}
          onSelectToken={this.selectInput}
          onChange={this.changeInputValue}
          token={inputToken || {}}
          value={rawText}
          disabled={inputBalance === null}
          loading={inputBalance === null}
          placeholder="0"
          selectable={false}
        />
        <Text style={mainStyle.error}>
          {inputError}
        </Text>
        <View style={mainStyle.arrowWrapper}>
          <Divider style={mainStyle.divider} />
          <Image source={addLiquidityIcon} style={mainStyle.arrow} />
          <Divider style={mainStyle.divider} />
        </View>
        <NewInput
          tokens={outputList}
          onSelectToken={this.selectOutput}
          onChange={this.changeOutputValue}
          token={outputToken || {}}
          value={outputText}
          placeholder="0"
        />
        <Text style={mainStyle.error}>
          {outputError}
        </Text>
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
    } = this.state;

    return (
      <View style={mainStyle.componentWrapper}>
        <View style={mainStyle.content}>
          {this.renderInputs()}
          <View style={[mainStyle.actionsWrapper]}>
            <RoundCornerButton
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
          {this.renderFee()}
        </View>
      </View>
    );
  }
}

Pool.propTypes = {
  wallet: PropTypes.object.isRequired,
  onUpdateParams: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired,
  pairs: PropTypes.array.isRequired,
  tokens: PropTypes.array.isRequired,
  params: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  navigation: PropTypes.object.isRequired,
};

export default Pool;
