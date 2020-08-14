import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Button, Image, Text, Toast, View} from '@src/components/core';
import accountService from '@services/wallet/accountService';
import {Divider} from 'react-native-elements';
import ExchangeRate from '@screens/Dex/components/ExchangeRate';
import formatUtil from '@utils/format';
import PoolSize from '@screens/Dex/components/PoolSize';
import { getEstimateFeePerKB } from '@services/wallet/RpcClientService';
import {RemoveLiquidityHistory} from '@models/dexHistory';
import tradeArrow from '@src/assets/images/icons/circle_arrow_down.png';
import ShareInput from '@screens/Dex/components/ShareInput';
import RemoveSuccessDialog from '@screens/Dex/components/RemoveSuccessDialog';
import SharePercent from '@screens/Dex/components/SharePercent';
import Loading from '@screens/Dex/components/Loading';
import {ExHandler} from '@services/exception';
import CODE from '@services/exception/customError/code';
import convertUtil from '@utils/convert';
import NetworkFee from '@screens/Dex/components/NetworkFee';
import {
  DEX_CHAIN_ACCOUNT,
  MESSAGES,
  MIN_INPUT,
  REMOVE_LIQUIDITY_TX_SIZE,
} from '../../constants';
import stylesheet from './style';
import {mainStyle} from '../../style';

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

  async estimateFee() {
    this.setState({ fee: null });
    const data = await getEstimateFeePerKB(DEX_CHAIN_ACCOUNT.PaymentAddress);
    const fee = data.unitFee * REMOVE_LIQUIDITY_TX_SIZE;
    this.setState({ fee });
  }

  loadData() {
    this.filterList();
    this.estimateFee();
  }

  selectPair = (pair) => {
    this.setState({
      pair,
      shareValue: 1,
      rawText: '1',
      topText: 0,
      bottomText: 0,
      shareError: null,
    }, async () => {
      this.filterList();
    });
  };

  changeShare = (text) => {
    const { pair } = this.state;
    let number = convertUtil.toNumber(text);
    let value = 0;
    let error;

    if (text.length === 0) {
      error = null;
    } else if (_.isNaN(number) || Math.abs(number % 1) > 0) {
      error = MESSAGES.MUST_BE_INTEGER;
    } else {
      value = number;
      if (number < MIN_INPUT) {
        error = MESSAGES.MUST_BE_INTEGER;
        value = 0;
      } else if (number > pair.share) {
        error = MESSAGES.SHARE_INSUFFICIENT;
      }
    }

    this.setState({
      rawText: text ? text.toString() : '',
      shareValue: value,
      shareError: error,
    }, this.calculateValue);
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

  filterList() {
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

        return {
          shareKey: shareKey.slice(shareKey.indexOf(tokenIds[0])),
          token1,
          token2,
          [tokenIds[0]]: pairInfo[tokenIds[0]],
          [tokenIds[1]]: pairInfo[tokenIds[1]],
          share: shares[shareKey],
          totalShare,
        };
      })
      .filter(pair => pair && pair.share > 0);

    console.debug('SHARES', userPairs);

    let { pair } = this.state;
    const p = pair && userPairs.find(item => item.shareKey === pair.shareKey);
    if (p) {
      pair = p;
    } else if (userPairs.length > 0) {
      pair = userPairs[0];
    } else {
      pair = null;
    }

    this.setState({ userPairs, pair }, this.calculateValue);
  }

  calculateValue() {
    const { pair, shareValue } = this.state;

    if (!pair) {
      return;
    }

    try {
      const { totalShare, token1, token2 } = pair;
      const pool1Value = pair[token1.id];
      const pool2Value = pair[token2.id];
      const sharePercent = shareValue / totalShare;
      const topValue = Math.floor(sharePercent * pool1Value) || 0;
      const bottomValue = Math.floor(sharePercent * pool2Value) || 0;
      let topText = formatUtil.amount(topValue, token1.pDecimals);
      let bottomText = formatUtil.amount(bottomValue, token2.pDecimals);
      const ZERO_PATTERN = /^[0.]*$/;

      if (ZERO_PATTERN.test(topText)) {
        topText = '0';
      }

      if (ZERO_PATTERN.test(bottomText)) {
        bottomText = '0';
      }

      this.setState({ topText, bottomText });
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

  async validateFee(account) {
    const { wallet } = this.props;
    const { fee } = this.state;
    const balance = await accountService.getBalance(account, wallet);
    if (fee > balance) {
      const error = new Error();
      error.code = CODE.NOT_ENOUGH_NETWORK_FEE_ADD;
      throw error;
    }
  }

  closeSuccess = () => {
    this.setState({ showSuccess: false });
    this.changeShare('1');
  };

  remove = async () => {
    const { accounts, onAddHistory, wallet } = this.props;
    const { pair, topText, bottomText, fee, shareValue, removing } = this.state;
    const { token1, token2 } = pair;
    let newHistory;

    console.debug('REMOVE LIQUIDITY', fee);

    if (removing) {
      return;
    }

    try {
      this.setState({ removing: true });
      const account = accounts.find(item => pair.shareKey.includes(item.PaymentAddress));
      await this.validateFee(account);
      const res = await accountService.createAndSendWithdrawDexTx(wallet, account, fee, token1.id, token2.id, shareValue);
      const token1Params = this.createTokenParams(token1, topText);
      const token2Params = this.createTokenParams(token2, bottomText);
      newHistory = new RemoveLiquidityHistory(res, shareValue, token1Params, token2Params, fee, account);
      onAddHistory(newHistory);
      this.setState({ showSuccess: true });
    } catch (error) {
      Toast.showError(new ExHandler(error).getMessage(MESSAGES.TRADE_ERROR));
    } finally {
      this.setState({ removing: false });
    }
  };

  renderFee() {
    const {
      pair,
      fee,
    } = this.state;

    if (!pair || !pair.token1 || !pair.token2) {
      return null;
    }

    return (
      <View style={mainStyle.feeWrapper}>
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
        <SharePercent share={pair.share} totalShare={pair.totalShare} />
        <NetworkFee fee={fee ? fee : null} />
      </View>
    );
  }

  renderInputs() {
    const { isLoading } = this.props;
    const {
      inputToken,
      shareError,
      rawText,
      pair,
      userPairs,
      topText,
      bottomText,
    } = this.state;
    return (
      <View>
        <ShareInput
          pairs={userPairs}
          pair={pair}
          onSelectPair={this.selectPair}
          onChange={this.changeShare}
          headerTitle="Shares"
          token={inputToken}
          value={rawText}
          pool={!!pair && !!inputToken && pair[inputToken.id]}
          disabled={isLoading}
        />
        {!!shareError && (
          <Text style={mainStyle.error}>
            {shareError}
          </Text>
        )}
        <View style={mainStyle.arrowWrapper}>
          <Divider style={mainStyle.divider} />
          <Image source={tradeArrow} style={mainStyle.arrow} />
          <Divider style={mainStyle.divider} />
        </View>
        {!!pair && (
          <View>
            <Text style={stylesheet.headerTitle}>Output (estimated)</Text>
            <View style={mainStyle.twoColumns}>
              <Text style={stylesheet.output}>{topText}</Text>
              <Text style={stylesheet.symbol}>{pair.token1?.symbol}</Text>
            </View>
            <Text style={stylesheet.output}>+</Text>
            <View style={mainStyle.twoColumns}>
              <Text style={stylesheet.output}>{bottomText}</Text>
              <Text style={stylesheet.symbol}>{pair.token2?.symbol}</Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  render() {
    const { isLoading } = this.props;
    const {
      shareError,
      shareValue,
      fee,
      removing,
      topText,
      bottomText,
      pair,
      showSuccess,
    } = this.state;

    return (
      <View style={mainStyle.componentWrapper}>
        <View>
          <View style={mainStyle.content}>
            {this.renderInputs()}
            {this.renderFee()}
            <View style={[mainStyle.actionsWrapper]}>
              <Button
                title="Remove liquidity"
                style={[mainStyle.button]}
                disabled={
                  removing ||
                  shareError ||
                  !shareValue ||
                  shareValue <= 0 ||
                  !fee ||
                  isLoading ||
                  (topText === '0' && bottomText === '0')
                }
                disabledStyle={mainStyle.disabledButton}
                onPress={this.remove}
              />
            </View>
          </View>
        </View>
        <Loading open={!!removing} />
        <RemoveSuccessDialog
          show={showSuccess}
          token1={pair?.token1}
          token2={pair?.token2}
          topValue={topText}
          bottomValue={bottomText}
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
  accounts: PropTypes.array.isRequired,
  pairs: PropTypes.array.isRequired,
  tokens: PropTypes.array.isRequired,
  params: PropTypes.object.isRequired,
  shares: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default Pool;
