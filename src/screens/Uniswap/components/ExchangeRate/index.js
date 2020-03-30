import React from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View,
} from '@src/components/core';
import style from './style';

class ExchangeRate extends React.PureComponent {
  render() {
    const {
      inputToken,
      outputToken,
      price,
    } = this.props;

    if (
      !outputToken ||
      !price ||
      !inputToken
    ) {
      return null;
    }

    return (
      <View style={style.twoColumns}>
        <Text style={[style.feeTitle]}>Exchange Rate:</Text>
        <Text style={[style.fee, style.textRight, style.ellipsis]} numberOfLines={1}>
          1 {inputToken.symbol} =&nbsp;
          {price}
          &nbsp;{outputToken?.symbol}
        </Text>
      </View>
    );
  }
}

ExchangeRate.propTypes = {
  inputToken: PropTypes.object,
  outputToken: PropTypes.object,
  price: PropTypes.string,
};

ExchangeRate.defaultProps = {
  price: '0',
  inputToken: null,
  outputToken: null,
};

export default ExchangeRate;
