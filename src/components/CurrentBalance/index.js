import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import formatUtil from '@src/utils/format';
import CurrentBalance from './CurrentBalance';

const CurrentBalanceContainer = ({ selectedPrivacy, symbol, select, hideBalanceTitle, containerStyle, isNestedCurrentBalance, tokenStyle, balanceStyle }) => {
  if (!selectedPrivacy) return null;
  return (
    <CurrentBalance
      containerStyle={containerStyle}
      balanceStyle={balanceStyle}
      tokenStyle={tokenStyle}
      isNestedCurrentBalance={isNestedCurrentBalance}
      hideBalanceTitle={hideBalanceTitle}
      amount={formatUtil.amount(selectedPrivacy?.amount, selectedPrivacy?.pDecimals)}
      symbol={selectedPrivacy?.externalSymbol ||  selectedPrivacy?.symbol || symbol}
      select={select}
      tokenId={selectedPrivacy.tokenId}
    />
  );
};

const mapState = state => ({
  selectedPrivacy: selectedPrivacySeleclor.selectedPrivacy(state)
});

CurrentBalanceContainer.defaultProps = {
  selectedPrivacy: null,
  symbol: null,
  select: null,
  hideBalanceTitle: false,
  containerStyle: {},
};

CurrentBalanceContainer.propTypes = {
  selectedPrivacy: PropTypes.object,
  symbol: PropTypes.string,
  select: PropTypes.element,
  hideBalanceTitle: PropTypes.bool,
  containerStyle: PropTypes.object
};

export default connect(mapState)(CurrentBalanceContainer);
