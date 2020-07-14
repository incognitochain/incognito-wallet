import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import formatUtil from '@utils/format';
import ExtraInfo from '@screens/DexV2/components/ExtraInfo';

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

    const formattedInputPool = formatUtil.amount(inputPool, inputToken.pDecimals, true);
    const formattedOutputPool = formatUtil.amount(outputPool, outputToken.pDecimals, true);
    return (
      <ExtraInfo
        left="Pool size:"
        right={`${formattedInputPool} ${inputToken.symbol} + ${formattedOutputPool} ${outputToken.symbol}`}
      />
    );
  }
}

PoolSize.propTypes = {
  inputToken: PropTypes.object.isRequired,
  outputToken: PropTypes.object.isRequired,
  pair: PropTypes.object.isRequired,
};

export default PoolSize;
