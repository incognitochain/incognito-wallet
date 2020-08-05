import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import formatUtil from '@utils/format';
import ExtraInfo from '@screens/DexV2/components/ExtraInfo';

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

    const rawRate = _.floor(outputValue / (inputValue / Math.pow(10, inputToken.pDecimals || 0)));
    const displayRate = formatUtil.amount(rawRate, outputToken.pDecimals);
    const outSymbol = outputToken.symbol;
    const inSymbol = inputToken.symbol;
    return (
      <ExtraInfo
        left="Exchange rate:"
        right={`1 ${inSymbol} = ${displayRate} ${outSymbol}`}
      />
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
