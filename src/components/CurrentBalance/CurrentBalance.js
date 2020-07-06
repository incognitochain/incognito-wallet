import React from 'react';
import PropTypes from 'prop-types';
import { View, Text } from '@src/components/core';
import CryptoIcon from '@components/CryptoIcon/index';
import { generateTestId } from '@utils/misc';
import { SEND } from '@src/constants/elements';
import styles from './style';

const CurrentBalance = ({ amount, symbol, select, tokenId, containerStyle, hideBalanceTitle, tokenStyle, balanceStyle, selectContainer }) => (
  <View style={[styles.container, containerStyle]}>
    {hideBalanceTitle && hideBalanceTitle ? null : <Text style={[styles.desc, containerStyle]}>Current balance</Text>}
    <View style={styles.balanceContainer}>
      {hideBalanceTitle ? null : <Text style={[styles.balance, balanceStyle]} numberOfLines={1} ellipsizeMode='tail' {...generateTestId(SEND.BALANCE)}>{amount}</Text>}
      <View style={select ? [styles.selectContainer, selectContainer] : null}>
        {select && !hideBalanceTitle? <CryptoIcon key={tokenId} tokenId={tokenId} size={22} /> : null}
        <Text {...generateTestId(SEND.TOKEN_SYMBOL)} style={[styles.balanceSymbol, select ? styles.selectText : null, tokenStyle]} numberOfLines={1} ellipsizeMode='tail'>{symbol}</Text>
        {select ? select : null}
      </View>
    </View>
  </View>
);

CurrentBalance.defaultProps = {
  amount: null,
  symbol: null,
  select: null,
  tokenId: '',
  hideBalanceTitle: false,
  containerStyle: {},
  tokenStyle: {},
  balanceStyle: {},
  selectContainer: {}
};

CurrentBalance.propTypes = {
  amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  symbol: PropTypes.string,
  select: PropTypes.element,
  tokenId: PropTypes.string,
  hideBalanceTitle: PropTypes.bool,
  containerStyle: PropTypes.object,
  tokenStyle: PropTypes.object,
  balanceStyle: PropTypes.object,
  selectContainer: PropTypes.object,
};

export default CurrentBalance;
