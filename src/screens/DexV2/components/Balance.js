import React from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator } from '@src/components/core';
import formatUtils from '@utils/format';
import ExtraInfo from '@screens/DexV2/components/ExtraInfo';

const Balance = (props) => {
  const { token, balance, title, style, hideRightSymbol } = props;

  const right = balance === null ?
    <ActivityIndicator size="small" /> :
    `${formatUtils.amountFull(balance, token.pDecimals)} ${!hideRightSymbol ? token.symbol : ''}`;

  return (
    <ExtraInfo
      left={title ? title : `${token.symbol} balance`}
      right={right}
      style={style}
    />
  );
};

Balance.defaultProps = {
  balance: null,
  title: '',
  style: null,
  hideRightSymbol: false,
};

Balance.propTypes = {
  token: PropTypes.object.isRequired,
  title: PropTypes.string,
  balance: PropTypes.number,
  style: PropTypes.object,
  hideRightSymbol: PropTypes.bool,
};

export default Balance;
