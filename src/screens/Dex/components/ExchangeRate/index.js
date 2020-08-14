import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  Text,
  View,
} from '@src/components/core';
import formatUtil from '@utils/format';
import style from './style';

class ExchangeRate extends React.PureComponent {
  render() {
    const {
      inputToken,
      inputValue,
      outputToken,
      outputValue,
    } = this.props;

    if (
      !outputToken ||
      !outputValue ||
      !_.isNumber(outputValue) ||
      !inputValue || !_.isNumber(inputValue)
    ) {
      return null;
    }

    const rawRate = outputValue / (inputValue / Math.pow(10, inputToken.pDecimals || 0));
    return (
      <View style={style.twoColumns}>
        <Text style={[style.feeTitle]}>Exchange Rate:</Text>
        <Text style={[style.fee, style.textRight, style.ellipsis]} numberOfLines={1}>
          1 {inputToken?.symbol} =&nbsp;
          {formatUtil.amount(rawRate, outputToken.pDecimals)}
          &nbsp;{outputToken?.symbol}
        </Text>
      </View>
    );
  }
}

ExchangeRate.propTypes = {
  inputToken: PropTypes.object.isRequired,
  inputValue: PropTypes.number.isRequired,
  outputToken: PropTypes.object.isRequired,
  outputValue: PropTypes.number.isRequired,
};

export default ExchangeRate;
