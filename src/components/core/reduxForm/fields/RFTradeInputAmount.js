import React from 'react';
import TradeInputAmount from '@src/components/core/TradeInputAmount';
import PropTypes from 'prop-types';
import createField from './createField';

const renderCustomField = (props) => {
  const { input, onChangeTextCustom, ...rest } = props;
  const { onChange, onFocus, onBlur, ...restInput } = input;
  return (
    <TradeInputAmount
      {...{
        ...rest,
        ...restInput,
        onChangeText: (text) => {
          onChange(text);
        },
        onFocus: (event) => onFocus(event),
        onBlur: (event) => onBlur(event),
      }}
    />
  );
};

const RFTradeInputAmount = createField({
  fieldName: 'RFTradeInputAmount',
  render: renderCustomField,
});

renderCustomField.defaultProps = {};

renderCustomField.propTypes = {
  input: PropTypes.element.isRequired,
  onChangeTextCustom: PropTypes.func.isRequired
};

export default React.memo(RFTradeInputAmount);
