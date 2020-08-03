import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  Text,
  View,
} from '@src/components/core';
import formatUtil from '@utils/format';
import style from './style';

class PoolSize extends React.Component {
  render() {
    const {
      inputToken,
      outputToken,
      pair,
    } = this.props;

    if (!inputToken || !outputToken || _.isEmpty(pair)) {
      return null;
    }

    const inputPool = pair[inputToken.id];
    const outputPool = pair[outputToken.id];

    const formattedInputPool = formatUtil.amount(inputPool, inputToken.pDecimals);
    const formattedOutputPool = formatUtil.amount(outputPool, outputToken.pDecimals);
    return (
      <View style={style.twoColumns}>
        <Text style={[style.feeTitle]}>Pool Size:</Text>
        <View style={[style.flex, style.textRight]}>
          <Text style={style.fee} numberOfLines={2}>
            {formattedInputPool} {inputToken?.symbol} + {formattedOutputPool} {outputToken?.symbol}
          </Text>
        </View>
      </View>
    );
  }
}

PoolSize.propTypes = {
  inputToken: PropTypes.object.isRequired,
  outputToken: PropTypes.object.isRequired,
  pair: PropTypes.object.isRequired,
};

export default PoolSize;
