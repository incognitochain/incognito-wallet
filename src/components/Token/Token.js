import React from 'react';
import { Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import withToken, { TokenContext } from '@src/components/Token/Token.enhance';
import { TokenVerifiedIcon } from '@src/components/Icons';
import format from '@src/utils/format';
import floor from 'lodash/floor';
import round from 'lodash/round';
import { CONSTANT_COMMONS } from '@src/constants';
import Swipeout from 'react-native-swipeout';
import { BtnDelete } from '@src/components/Button';
import replace from 'lodash/replace';
import convert from '@src/utils/convert';
import { styled } from './Token.styled';

const defaultProps = {
  displayName: 'Sample name',
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

export const NormalText = ({
  style = null,
  stylePSymbol = null,
  containerStyle = null,
  text = '',
  hasPSymbol = false,
}) => (
  <View style={[styled.normalText, containerStyle]}>
    {hasPSymbol && <Text style={[styled.pSymbol, stylePSymbol]}>ℙ</Text>}
    <Text numberOfLines={1} style={[styled.text, style]} ellipsizeMode="tail">
      {text}
    </Text>
  </View>
);

export const Name = props => {
  const { tokenProps } = React.useContext(TokenContext);
  const { name = 'Sample Name', isVerified = false } =
    tokenProps || defaultProps;
  return (
    <View style={styled.name}>
      <NormalText text={name} style={[styled.boldText, props?.styledName]} />
      {isVerified && <TokenVerifiedIcon style={styled.verifiedIcon} />}
    </View>
  );
};

export const AmountBasePRV = props => {
  const {
    amount = 0,
    pricePrv = 0,
    customStyle = null,
    customPSymbolStyle = null,
    pDecimals,
  } = props;
  const _amount = format.amount(
    convert.toNumber(format.amountFull(amount, pDecimals), true) * pricePrv,
  );
  return (
    <NormalText
      hasPSymbol
      text={`${_amount}`}
      style={[styled.boldText, styled.rightText, customStyle]}
      stylePSymbol={[styled.pSymbolBold, customPSymbolStyle]}
    />
  );
};

export const ChangePrice = props => {
  const { change = '0', customStyle = null } = props;
  const isTokenDecrease = change[0] === '-';
  const changeToNumber = Number(replace(change, '-', ''));
  if (changeToNumber === 0) {
    return null;
  }
  return (
    <NormalText
      text={` ${isTokenDecrease ? '-' : '+'}${round(changeToNumber, 2)}%`}
      style={[
        styled.bottomText,
        isTokenDecrease ? styled.redText : styled.greenText,
        customStyle,
      ]}
    />
  );
};

const Price = props => {
  const { pricePrv = 0, change = '0' } = props;
  return (
    <View style={styled.priceContainer}>
      <NormalText
        text={format.amount(floor(pricePrv, 9), 0)}
        hasPSymbol
        style={styled.bottomText}
      />
      <ChangePrice change={change} />
    </View>
  );
};

export const Amount = props => {
  const {
    amount = 0,
    pDecimals = 0,
    symbol = '',
    customStyle = null,
    showSymbol = true,
    isGettingBalance = false,
    showGettingBalance = false,
    hasPSymbol = false,
    stylePSymbol = null,
    containerStyle = null,
  } = props;
  const shouldShowGettingBalance = isGettingBalance && showGettingBalance;
  if (shouldShowGettingBalance) {
    return <ActivityIndicator size="small" />;
  }
  return (
    <NormalText
      style={[styled.bottomText, customStyle]}
      text={`${format.amount(floor(amount, 9), pDecimals)} ${
        showSymbol ? symbol : ''
      }`}
      hasPSymbol={hasPSymbol}
      stylePSymbol={stylePSymbol}
      containerStyle={containerStyle}
    />
  );
};

export const Symbol = () => {
  const { tokenProps } = React.useContext(TokenContext);
  const {
    symbol = '',
    networkName = '',
    isErc20Token = false,
    isBep2Token = false,
  } = tokenProps;
  return (
    <NormalText
      allowFontScaling={false}
      style={styled.bottomText}
      text={`${symbol} ${
        isErc20Token || isBep2Token ? `(${networkName})` : ''
      }`}
    />
  );
};

const TokenPairPRV = props => (
  <TouchableOpacity onPress={props?.onPress}>
    <View style={[styled.container, props?.style]}>
      <View style={[styled.extra, styled.extraTop]}>
        <Name />
        <AmountBasePRV {...props} />
      </View>
      <View style={styled.extra}>
        <Price {...props} />
        <Amount {...props} />
      </View>
    </View>
  </TouchableOpacity>
);

const TokenDefault = props => (
  <TouchableOpacity onPress={props?.onPress}>
    <View style={[styled.container, props?.style]}>
      <View style={styled.extra}>
        <Name />
        <Amount {...{ ...props, customStyle: styled.boldText }} />
      </View>
    </View>
  </TouchableOpacity>
);

const Token = props => {
  const {
    handleRemoveToken = null,
    swipable = false,
    pairWithPrv = false,
  } = props;
  let TokenComponent = pairWithPrv ? (
    <TokenPairPRV {...props} />
  ) : (
    <TokenDefault {...props} />
  );
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

Name.defaultProps = {
  styledName: null,
};

Name.propTypes = {
  styledName: PropTypes.object,
};

Token.defaultProps = { ...defaultProps };

Token.propTypes = {
  pDecimals: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  displayName: PropTypes.string,
  amount: PropTypes.number,
  onPress: PropTypes.func,
  symbol: PropTypes.string,
  isGettingBalance: PropTypes.bool,
  style: PropTypes.object,
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
