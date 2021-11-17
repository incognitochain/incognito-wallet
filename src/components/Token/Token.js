import React from 'react';
import { Text, View } from 'react-native';
import PropTypes from 'prop-types';
import withToken from '@src/components/Token/Token.enhance';
import { TokenVerifiedIcon } from '@src/components/Icons';
import round from 'lodash/round';
import Swipeout from 'react-native-swipeout';
import { BtnDelete, BtnInfo } from '@src/components/Button';
import replace from 'lodash/replace';
import trim from 'lodash/trim';
import { TouchableOpacity, ActivityIndicator } from '@src/components/core';
import { useSelector } from 'react-redux';
import { currencySelector, decimalDigitsSelector } from '@src/screens/Setting';
import { prefixCurrency, pTokenSelector } from '@src/redux/selectors/shared';
import { formatAmount, formatPrice } from '@components/Token/Token.utils';
import { styled } from './Token.styled';

export const NormalText = (props) => {
  const prefix = useSelector(prefixCurrency);
  const { style, stylePSymbol, containerStyle, text, hasPSymbol, showBalance, symbol } = props;
  return (
    <View style={[styled.normalText, containerStyle]}>
      {hasPSymbol && showBalance && (
        <Text style={[styled.pSymbol, stylePSymbol]}>{prefix}</Text>
      )}
      <Text numberOfLines={1} style={[styled.text, style]} ellipsizeMode="tail">
        {showBalance ? trim(text) : `••• ${symbol}`}
      </Text>
    </View>
  );
};

NormalText.propTypes = {
  style: PropTypes.any,
  stylePSymbol: PropTypes.any,
  containerStyle: PropTypes.any,
  text: PropTypes.string,
  hasPSymbol: PropTypes.bool,
  showBalance: PropTypes.bool,
  symbol: PropTypes.string,
};

NormalText.defaultProps = {
  style: null,
  stylePSymbol: null,
  containerStyle: null,
  text: '',
  hasPSymbol: false,
  showBalance: true,
  symbol: ''
};

export const Name = (props) => {
  const { name, isVerified, tokenId, shouldShowInfo } = props;
  return (
    <View style={[styled.name, props?.styledContainerName]}>
      <NormalText text={name} style={[styled.boldText, props?.styledName]} />
      {isVerified && <TokenVerifiedIcon />}
      {shouldShowInfo && <BtnInfo tokenId={tokenId} />}
    </View>
  );
};

Name.propTypes = {
  name: PropTypes.string,
  isVerified: PropTypes.bool,
  tokenId: PropTypes.string,
  shouldShowInfo: PropTypes.bool,
};

Name.defaultProps = {
  name: 'Incognito Token',
  isVerified: false,
  tokenId: null,
  shouldShowInfo: false,
};

export const AmountBasePRV = (props) => {
  const {
    amount,
    pDecimals,
    pricePrv,
    customPSymbolStyle,
    customStyle,
    hideBalance,
  } = props;
  const decimalDigits = useSelector(decimalDigitsSelector);

  let currentAmount = formatAmount(
    pricePrv,
    amount,
    pDecimals,
    pDecimals,
    decimalDigits,
    false,
  );

  return (
    <NormalText
      hasPSymbol={hideBalance ? false : true}
      text={hideBalance ? '•••' : `${currentAmount}`}
      style={[styled.rightText, customStyle]}
      stylePSymbol={[customPSymbolStyle]}
    />
  );
};

AmountBasePRV.defaultProps = {
  amount: 0,
  pricePrv: 0,
  customStyle: null,
  customPSymbolStyle: null,
  hideBalance: false,
};

AmountBasePRV.propTypes = {
  amount: PropTypes.number,
  pricePrv: PropTypes.number,
  customStyle: PropTypes.any,
  customPSymbolStyle: PropTypes.any,
  pDecimals: PropTypes.number.isRequired,
  hideBalance: PropTypes.bool,
};

export const AmountBaseUSDT = React.memo((props) => {
  const {
    amount,
    pDecimals,
    priceUsd,
    customPSymbolStyle,
    customStyle,
    hideBalance,
  } = props;
  const decimalDigits = useSelector(decimalDigitsSelector);

  let currentAmount = formatAmount(
    priceUsd,
    amount,
    pDecimals,
    pDecimals,
    decimalDigits,
    false,
  );

  return (
    <NormalText
      hasPSymbol={hideBalance ? false : true}
      text={hideBalance ? '•••' : `${currentAmount}`}
      style={[styled.rightText, customStyle]}
      stylePSymbol={[customPSymbolStyle]}
    />
  );
});

export const ChangePrice = (props) => {
  const { change, customStyle } = props;
  const isTokenDecrease = change[0] === '-';
  const changeToNumber = Number(replace(change, '-', ''));
  if (changeToNumber === 0) {
    return null;
  }
  return (
    <NormalText
      text={` ${isTokenDecrease ? '-' : '+'}${round(changeToNumber, 2)}%`}
      style={[
        {
          marginLeft: 5,
        },
        styled.bottomText,
        isTokenDecrease ? styled.redText : styled.greenText,
        customStyle,
      ]}
    />
  );
};

ChangePrice.propTypes = {
  change: PropTypes.string,
  customStyle: PropTypes.any,
};

ChangePrice.defaultProps = {
  change: '0',
  customStyle: null,
};

const Price = (props) => {
  const { priceUsd, pricePrv } = props;
  const { isToggleUSD } = useSelector(pTokenSelector);

  return (
    <View style={styled.priceContainer}>
      <NormalText
        text={formatPrice(isToggleUSD ? priceUsd : pricePrv)}
        hasPSymbol
        style={styled.bottomText}
      />
    </View>
  );
};

Price.propTypes = {
  priceUsd: PropTypes.number,
  pricePrv: PropTypes.number,
};

Price.defaultProps = {
  priceUsd: 0,
  pricePrv: 0,
};

export const Amount = (props) => {
  const {
    amount,
    pDecimals,
    symbol,
    customStyle,
    showSymbol,
    isGettingBalance,
    showGettingBalance,
    hasPSymbol,
    stylePSymbol,
    containerStyle,
    size,
    hideBalance,
    fromBalance,
  } = props;
  const decimalDigits = useSelector(decimalDigitsSelector);
  const shouldShowGettingBalance = isGettingBalance || showGettingBalance;
  if (shouldShowGettingBalance) {
    return <ActivityIndicator size={size} />;
  }

  let amountWithDecimalDigits = formatAmount(
    1,
    amount,
    pDecimals,
    pDecimals,
    decimalDigits,
    false,
  );
  const style = hideBalance && fromBalance ? { fontSize: 56 } : {};
  return (
    <NormalText
      style={[styled.bottomText, styled.boldText, customStyle, style]}
      text={
        hideBalance
          ? fromBalance
            ? '•••••••'
            : `••• ${showSymbol ? symbol : ''}`
          : `${amountWithDecimalDigits} ${showSymbol ? symbol : ''}`
      }
      hasPSymbol={hideBalance ? false : hasPSymbol}
      stylePSymbol={stylePSymbol}
      containerStyle={containerStyle}
    />
  );
};

Amount.propTypes = {
  size: PropTypes.string,
  amount: PropTypes.number,
  pDecimals: PropTypes.number,
  symbol: PropTypes.string,
  customStyle: PropTypes.any,
  showSymbol: PropTypes.bool,
  isGettingBalance: PropTypes.bool,
  showGettingBalance: PropTypes.bool,
  hasPSymbol: PropTypes.bool,
  stylePSymbol: PropTypes.any,
  containerStyle: PropTypes.any,
  hideBalance: PropTypes.bool,
  fromBalance: PropTypes.bool,
};

Amount.defaultProps = {
  size: 'small',
  amount: 0,
  pDecimals: 0,
  symbol: '',
  customStyle: null,
  showSymbol: true,
  isGettingBalance: false,
  showGettingBalance: false,
  hasPSymbol: false,
  stylePSymbol: null,
  containerStyle: null,
  hideBalance: false,
  fromBalance: false,
};

export const Symbol = (props) => {
  const {
    symbol,
    networkName,
    isErc20Token,
    isBep2Token,
    isBep20Token,
    styledSymbol,
  } = props;
  return (
    <NormalText
      allowFontScaling={false}
      style={[styled.bottomText, styledSymbol]}
      text={`${symbol} ${
        isErc20Token || isBep2Token || isBep20Token ? `(${networkName})` : ''
      }`}
    />
  );
};

Symbol.propTypes = {
  symbol: PropTypes.string,
  networkName: PropTypes.string,
  isErc20Token: PropTypes.bool,
  isBep2Token: PropTypes.bool,
  styledSymbol: PropTypes.any,
};

Symbol.defaultProps = {
  symbol: '',
  networkName: '',
  isErc20Token: false,
  isBep2Token: false,
  styledSymbol: null,
};

const TokenPairPRV = (props) => (
  <TouchableOpacity onPress={props?.onPress}>
    <View style={[styled.container, props?.style]}>
      <View style={[styled.extra, styled.extraTop]}>
        <Name {...props} />
        <Amount {...props} />
      </View>
      <View style={styled.extra}>
        <Price {...props} />
        <AmountBasePRV {...props} />
      </View>
    </View>
  </TouchableOpacity>
);

const TokenDefault = (props) => (
  <TouchableOpacity onPress={props?.onPress}>
    <View style={[styled.container, props?.style]}>
      <View style={styled.extra}>
        <Name {...props} />
        <Amount {...{ ...props, customStyle: styled.boldText }} />
      </View>
    </View>
  </TouchableOpacity>
);

const TokenPairUSDT = (props) => (
  <TouchableOpacity onPress={props?.onPress}>
    <View style={[styled.container, props?.style]}>
      <View style={[styled.extra, styled.extraTop]}>
        <Name {...props} />
        <Amount {...props} />
      </View>
      <View style={styled.extra}>
        <Price {...props} />
        <AmountBaseUSDT {...props} />
      </View>
    </View>
  </TouchableOpacity>
);

export const Follow = (props) => {
  const { shouldShowFollowed, isFollowed } = props;
  if (!shouldShowFollowed) {
    return null;
  }
  if (isFollowed) {
    return <Text style={styled.followText}>Added</Text>;
  }
  return null;
};

Follow.propTypes = {
  shouldShowFollowed: PropTypes.bool.isRequired,
  isFollowed: PropTypes.bool.isRequired,
};

const Token = (props) => {
  const { handleRemoveToken = null, swipable = false, pricePrv, isPRV } = props;
  const isToggleUSD = useSelector(currencySelector);
  let TokenComponent;
  if (isToggleUSD) {
    TokenComponent = <TokenPairUSDT {...props} />;
  } else {
    const pairWithPRV = pricePrv !== 0 && !isPRV;
    TokenComponent = pairWithPRV ? (
      <TokenPairPRV {...props} />
    ) : (
      <TokenDefault {...props} />
    );
  }

  if (swipable === true) {
    return (
      <Swipeout
        autoClose
        style={{
          backgroundColor: 'transparent',
        }}
        right={[
          {
            component: (
              <BtnDelete
                showIcon={false}
                onPress={
                  typeof handleRemoveToken === 'function'
                    ? handleRemoveToken
                    : null
                }
              />
            ),
          },
        ]}
      >
        {TokenComponent}
      </Swipeout>
    );
  }
  return TokenComponent;
};

Token.defaultProps = {
  displayName: 'Incognito Token',
  amount: 0,
  onPress: null,
  symbol: null,
  isGettingBalance: false,
  style: null,
  pDecimals: null,
  isVerified: false,
  iconUrl: null,
  amountInPRV: 0,
  price: 0,
  percentChange: 0,
  pricePrv: 0,
};

Token.propTypes = {
  pDecimals: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  displayName: PropTypes.string,
  amount: PropTypes.number,
  onPress: PropTypes.func,
  symbol: PropTypes.string,
  isGettingBalance: PropTypes.bool,
  style: PropTypes.any,
  isVerified: PropTypes.bool,
  iconUrl: PropTypes.string,
  amountInPRV: PropTypes.number,
  price: PropTypes.number,
  percentChange: PropTypes.number,
  pricePrv: PropTypes.number,
  swipable: PropTypes.bool,
  removable: PropTypes.bool,
  handleRemoveToken: PropTypes.func,
};

export default withToken(React.memo(Token));
