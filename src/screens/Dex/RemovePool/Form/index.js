import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Image, RoundCornerButton, Text, Toast, View } from '@components/core/index';
import accountService from '@services/wallet/accountService';
import { Divider } from 'react-native-elements';
import ExchangeRate from '@screens/Dex/ExchangeRate';
import formatUtil from '@utils/format';
import PoolSize from '@screens/Dex/PoolSize';
import tradeArrow from '@assets/images/icons/circle_arrow_down.png';
import ShareInput from '@screens/Dex/ShareInput';
import SharePercent from '@screens/Dex/SharePercent';
import { ExHandler } from '@services/exception';
import convertUtil from '@utils/convert';
import routeNames from '@routers/routeNames';
import { MAX_FEE_PER_TX } from '@components/EstimateFee/EstimateFee.utils';
import {
  MESSAGES,
  MIN_INPUT,
} from '../../constants';
import stylesheet from './style';
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
    this.filterList();

    const { account, wallet } = this.props;
    const balance = await accountService.getBalance(account, wallet);

    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ balance });
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
      const topValue = Math.min(Math.floor(sharePercent * pool1Value), pool1Value) || 0;
      const bottomValue = Math.min(Math.floor(sharePercent * pool2Value), pool2Value) || 0;
      let topText = formatUtil.amountFull(topValue, token1.pDecimals, true);
      let bottomText = formatUtil.amountFull(bottomValue, token2.pDecimals, true);
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

  remove = async () => {
    const { navigation } = this.props;
    const { pair, topText, bottomText, shareValue, balance } = this.state;

    try {
      if (MAX_FEE_PER_TX > balance) {
        return this.setState({ inputError: MESSAGES.NOT_ENOUGH_PRV_NETWORK_FEE });
      }

      const percent = shareValue / pair.totalShare * 100;
      navigation.navigate(routeNames.RemoveLiquidityConfirm, {
        pair,
        topText,
        bottomText,
        value: shareValue,
        percent,
      });
    } catch (error) {
      Toast.showError(new ExHandler(error).getMessage(MESSAGES.TRADE_ERROR));
    }
  };

  renderFee() {
    const {
      pair,
    } = this.state;

    if (!pair || !pair.token1 || !pair.token2) {
      return null;
    }

    return (
      <View style={mainStyle.feeWrapper}>
        <SharePercent share={pair.share} totalShare={pair.totalShare} />
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
        <Text style={mainStyle.error}>
          {shareError}
        </Text>
        <View style={mainStyle.arrowWrapper}>
          <Divider style={mainStyle.divider} />
          <Image source={tradeArrow} style={mainStyle.arrow} />
          <Divider style={mainStyle.divider} />
        </View>
        {!!pair && (
          <Text style={stylesheet.output}>{topText} {pair.token1.symbol} + {bottomText} {pair.token2.symbol}</Text>
        )}
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
