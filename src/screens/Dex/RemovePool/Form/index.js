import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Image, RoundCornerButton, Text, Toast, View } from '@components/core/index';
import accountService from '@services/wallet/accountService';
import { Divider } from 'react-native-elements';
import ExchangeRate from '@screens/Dex/ExchangeRate';
import formatUtil from '@utils/format';
import PoolSize from '@screens/Dex/PoolSize';
import SharePercent from '@screens/Dex/SharePercent';
import { ExHandler } from '@services/exception';
import convertUtil from '@utils/convert';
import routeNames from '@routers/routeNames';
import { MAX_FEE_PER_TX } from '@components/EstimateFee/EstimateFee.utils';
import NewInput from '@screens/DexV2/components/NewInput';
import addLiquidityIcon from '@assets/images/icons/add_liquidity.png';
import Balance from '@screens/DexV2/components/Balance';
import {
  MESSAGES,
  MIN_INPUT,
} from '../../constants';
import { mainStyle } from '../../Home/style';

class Pool extends React.Component {
  constructor(props) {
    super(props);
    this.state = props.params;
  }

  componentDidUpdate(prevProps, prevState) {
    const { onUpdateParams } = this.props;

    if (this.state !== prevState) {
      onUpdateParams(this.state);
    }
  }

  async componentDidMount() {
    this.initList();

    const { account, wallet } = this.props;
    const balance = await accountService.getBalance(account, wallet);

    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ balance });
  }

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

  calculateInputValue() {
    const { pair } = this.state;

    if (!pair) {
      return;
    }

    try {
      const { inputToken, outputValue, inputBalance } = this.state;
      const data = this.calculateValue(undefined, outputValue);
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
      const { outputToken, inputValue, outputBalance } = this.state;
      const data = this.calculateValue(inputValue);
      const { outputValue, outputText } = data;
      const { error } = this.parseText(outputText, outputToken, outputBalance);

      this.setState({ outputValue, outputText, outputError: error });
    } catch (error) {
      console.debug('CALCULATE OUTPUT ERROR', error);
    }
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

  isUserPair = (tokenIds) => key => {
    const { accounts } = this.props;
    if (tokenIds.every(item => key.includes(item))) {
      return accounts.some(account => key.includes(account.PaymentAddress));
    }
  };

  findShareKey(shares, tokenIds) {
    return Object.keys(shares).find(this.isUserPair(tokenIds));
  }

  initList() {
    const { pairs, tokens, shares } = this.props;
    const userPairs = pairs
      .map(pairInfo => {
        const tokenIds = pairInfo.keys;
        const token1 = tokens.find(item => item.id === tokenIds[0]);
        const token2 = tokens.find(item => item.id === tokenIds[1]);
        const shareKey = this.findShareKey(shares, tokenIds);

        if (!shareKey) {
          return null;
        }

        let totalShare = 0;
        _.map(shares, (value, key) => {
          if (key.includes(tokenIds[0]) && key.includes(tokenIds[1])) {
            totalShare += value;
          }
        });

        const share = shares[shareKey];
        let sharePercent;
        let sharePercentDisplay;

        if (shares[shareKey] > 0) {
          sharePercent = share / totalShare * 100;
          sharePercentDisplay = `${formatUtil.toFixed(sharePercent, 4)} %`;
        }

        return {
          shareKey: shareKey.slice(shareKey.indexOf(tokenIds[0])),
          token1,
          token2,
          [tokenIds[0]]: pairInfo[tokenIds[0]],
          [tokenIds[1]]: pairInfo[tokenIds[1]],
          share: shares[shareKey],
          sharePercent,
          sharePercentDisplay,
          totalShare,
        };
      })
      .filter(pair => pair && pair.share > 0);

    const inputList = [];
    const outputList = [];

    if (userPairs && userPairs.length) {
      userPairs.forEach(item => {
        if (!inputList.includes(item.token1.id)) {
          inputList.push(item.token1);
        }

        if (!inputList.includes(item.token2.id)) {
          inputList.push(item.token2);
        }
      });
    }

    let { inputToken } = this.state;
    inputToken = inputToken || _.get(inputList, 0);

    this.setState({
      userPairs,
      inputList,
      outputList,
      inputToken,
      outputToken: null,
    }, this.filterList);
  }

  filterList() {
    const { inputList, inputToken, userPairs } = this.state;

    const outputList = [];
    if (inputList && inputList.length) {
      inputList.forEach(item => {
        if (!outputList.includes(item.id) && inputToken.id !== item.id) {
          outputList.push(item);
        }
      });
    }

    let { outputToken } = this.state;
    outputToken = outputToken || _.get(outputList, 0);

    let pair;
    if (inputToken && outputToken) {
      pair = userPairs.find(item => item.shareKey.includes(inputToken.id) && item.shareKey.includes(outputToken.id));
    }

    let sharePercent = _.get(pair, 'sharePercent', 0) / 100;
    let inputBalance = _.get(pair, inputToken?.id, 0);
    if (inputBalance > 0) {
      inputBalance = _.floor(inputBalance * sharePercent);
    }

    let outputBalance = _.get(pair, outputToken?.id, 0);
    if (outputBalance > 0) {
      outputBalance = _.floor(outputBalance * sharePercent);
    }

    this.setState({
      outputList,
      outputToken,
      pair,
      inputValue: 0,
      outputValue: 0,
      rawText: '',
      outputText: '',
      inputBalance,
      outputBalance,
    });
  }

  calculateValue(inputValue = 0, outputValue = 0) {
    const { pair } = this.state;

    if (!pair) {
      return;
    }

    let value;
    let text;

    try {
      const { totalShare, token1, token2 } = pair;
      const pool1Value = pair[token1.id];
      const pool2Value = pair[token2.id];

      let inputPercent = inputValue / pool1Value;
      let outputPercent = outputValue / pool2Value;

      if (inputValue) {
        outputPercent = inputPercent;
        value = _.floor(outputPercent * pool2Value);
        text = formatUtil.amountFull(value, token1.pDecimals);
      }

      if (outputValue) {
        inputPercent = outputPercent;
        value = _.floor(inputPercent * pool1Value);
        text = formatUtil.amountFull(value, token2.pDecimals);
      }


      const sharePercent = inputPercent;
      const shareValue = _.floor(sharePercent * totalShare);

      this.setState({
        shareValue,
      });

      return { outputValue: value, outputText: text };
    } catch (error) {
      console.debug('CALCULATE OUTPUT ERROR', error);
    }
  }

  remove = async () => {
    const { navigation } = this.props;
    const { pair, rawText, outputText, shareValue, balance } = this.state;

    try {
      if (MAX_FEE_PER_TX > balance) {
        return this.setState({ inputError: MESSAGES.NOT_ENOUGH_PRV_NETWORK_FEE });
      }

      const percent = shareValue / pair.totalShare * 100;
      navigation.navigate(routeNames.RemoveLiquidityConfirm, {
        pair,
        topText: rawText,
        bottomText: outputText,
        value: shareValue,
        percent,
      });
    } catch (error) {
      Toast.showError(new ExHandler(error).getMessage(MESSAGES.TRADE_ERROR));
    }
  };

  selectInput = (inputToken) => {
    this.setState({
      inputToken,
      inputValue: 0,
      outputToken: null,
      rawText: '',
      outputValue: 0,
      outputText: '',
      inputError: null,
    }, this.filterList);
  };

  selectOutput = (outputToken) => {
    this.setState({
      inputValue: 0,
      rawText: '',
      outputToken: outputToken,
      outputValue: 0,
      outputText: '',
      outputError: null,
    }, this.filterList);
  };

  renderFee() {
    const {
      pair,
      inputToken,
      inputBalance,
      outputToken,
      outputBalance,
    } = this.state;

    if (!pair || !pair.token1 || !pair.token2 || !inputToken || !outputToken) {
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
          inputToken={pair.token1}
          inputValue={pair[pair.token1.id]}
          outputToken={pair.token2}
          outputValue={pair[pair.token2.id]}
        />
        <PoolSize
          inputToken={pair.token1}
          pair={pair}
          outputToken={pair.token2}
        />
      </View>
    );
  }

  renderInputs() {
    const { isLoading } = this.props;
    const {
      inputToken,
      inputList,
      outputList,
      outputToken,
      outputText,
      userPairs,
      rawText,
      inputError,
      outputError,
    } = this.state;

    if (!userPairs || userPairs.length <= 0) {
      return <Text>{MESSAGES.NO_PAIR}</Text>;
    }

    return (
      <View>
        <NewInput
          tokens={inputList}
          onSelectToken={this.selectInput}
          onChange={this.changeInputValue}
          token={inputToken || {}}
          value={rawText}
          placeholder="0"
          disabled={isLoading}
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
          disabled={isLoading}
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
      shareError,
      shareValue,
      topText,
      bottomText,
    } = this.state;

    return (
      <View style={mainStyle.componentWrapper}>
        <View>
          <View style={mainStyle.content}>
            {this.renderInputs()}
            <View style={[mainStyle.actionsWrapper]}>
              <RoundCornerButton
                title="Remove liquidity"
                style={[mainStyle.button]}
                disabled={
                  shareError ||
                  !shareValue ||
                  shareValue <= 0 ||
                  isLoading ||
                  (topText === '0' && bottomText === '0')
                }
                disabledStyle={mainStyle.disabledButton}
                onPress={this.remove}
              />
            </View>
            {this.renderFee()}
          </View>
        </View>
      </View>
    );
  }
}

Pool.propTypes = {
  onUpdateParams: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  accounts: PropTypes.array.isRequired,
  pairs: PropTypes.array.isRequired,
  tokens: PropTypes.array.isRequired,
  params: PropTypes.object.isRequired,
  shares: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default Pool;
