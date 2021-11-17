import React, {memo} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import PropTypes from 'prop-types';
import withToken from '@screens/Wallet/features/Home/Wallet.enhanceToken';
import {batch, useDispatch, useSelector} from 'react-redux';
import {currencySelector, hideWalletBalanceSelector} from '@screens/Setting';
import Swipeout from 'react-native-swipeout';
import { BtnDelete } from '@components/Button';
import { tokenStyled } from '@screens/Wallet/features/Home/Wallet.styled';
import { Row } from '@src/components';
import { formatAmount, formatPrice } from '@components/Token';
import format from '@utils/format';
import replace from 'lodash/replace';
import round from 'lodash/round';
import { COLORS, FONT } from '@src/styles';
import { ActivityIndicator } from '@components/core';
import { NormalText } from '@components/Token/Token';
import {actionInitSwapForm, purePairsSelector} from '@screens/PDexV3/features/Swap';
import {useNavigation} from 'react-navigation-hooks';
import routeNames from '@routers/routeNames';
import {actionChangeTab} from '@components/core/Tabs/Tabs.actions';
import {ROOT_TAB_TRADE, TAB_SWAP_ID} from '@screens/PDexV3/features/Trade/Trade.constant';
import {CONSTANT_CONFIGS} from '@src/constants';
import difference from 'lodash/difference';
import {PRVIDSTR} from 'incognito-chain-web-js/build/wallet';

const TokenDefault = React.memo((props) => {
  const { symbol, name, priceUsd, amount, pDecimals, decimalDigits, pricePrv, change, onPress, tokenId, isGettingBalance, showGettingBalance } = props;
  const pairs = useSelector(purePairsSelector);
  const shouldShowGettingBalance = isGettingBalance || showGettingBalance;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isToggleUSD = useSelector(currencySelector);
  const hideBalance = useSelector(hideWalletBalanceSelector);
  const balance = React.useMemo(() => {
    const price = isToggleUSD ? priceUsd : pricePrv;
    const amountCompare = formatAmount(price, amount, pDecimals, pDecimals, decimalDigits, false);
    const tokenAmount = format.amountVer2(amount, pDecimals);
    const isTokenDecrease = change[0] === '-';
    const changeToNumber = Number(replace(change, '-', ''));
    const changeStr = changeToNumber === 0 ? '' : `${isTokenDecrease ? '-' : '+'}${round(changeToNumber, 2)}%`;
    const changeColor = isTokenDecrease ? COLORS.red2 : COLORS.green;
    return {
      amountCompare,
      price: formatPrice(price),
      tokenAmount,
      changeStr,
      changeColor
    };
  }, [priceUsd, pricePrv, amount, isToggleUSD]);

  const onPressTrade = () => {
    const isPairUSDTExisted =
      difference([CONSTANT_CONFIGS.USDT_TOKEN_ID, tokenId], pairs).length === 0;
    let params = {
      buytoken: tokenId,
      selltoken: PRVIDSTR,
    };
    if (tokenId === CONSTANT_CONFIGS.USDT_TOKEN_ID) {
      params = {
        buytoken: PRVIDSTR,
        selltoken: CONSTANT_CONFIGS.USDT_TOKEN_ID,
      };
    } else if (isPairUSDTExisted) {
      params = {
        buytoken: tokenId,
        selltoken: CONSTANT_CONFIGS.USDT_TOKEN_ID,
      };
    }
    navigation.navigate(routeNames.Trade);
    setTimeout(() => {
      batch(() => {
        dispatch(actionInitSwapForm({
          defaultPair: params
        }));
        dispatch(
          actionChangeTab({
            rootTabID: ROOT_TAB_TRADE,
            tabID: TAB_SWAP_ID,
          }),
        );
      });
    }, 200);
  };
  return (
    <TouchableOpacity style={tokenStyled.container} onPress={onPress}>
      <View style={tokenStyled.wrapFirst}>
        <Row centerVertical>
          <Text numberOfLines={1} style={tokenStyled.blackText}>{symbol}</Text>
          {/*{isVerified && <TokenVerifiedIcon style={tokenStyled.icon} />}*/}
        </Row>
        <NormalText
          text={name}
          style={tokenStyled.grayText}
        />
      </View>
      <View style={tokenStyled.wrapSecond}>
        {shouldShowGettingBalance ?
          <ActivityIndicator />
          : (
            <NormalText
              text={balance.amountCompare}
              hasPSymbol
              style={tokenStyled.blackText}
              stylePSymbol={[
                tokenStyled.blackText,
                { fontFamily: FONT.NAME.specialRegular }
              ]}
              showBalance={!hideBalance}
            />
          )}
        <NormalText
          text={`${balance.tokenAmount}${symbol}`}
          style={tokenStyled.grayText}
          showBalance={!hideBalance}
          symbol={symbol}
        />
      </View>
      <View style={tokenStyled.wrapThird}>
        <NormalText
          text={balance.price}
          hasPSymbol
          style={tokenStyled.blackText}
          stylePSymbol={[
            tokenStyled.blackText,
            { fontFamily: FONT.NAME.specialRegular, }
          ]}
        />
        <Text numberOfLines={1} style={[tokenStyled.grayText, { color: balance.changeColor }]}>{balance.changeStr}</Text>
      </View>
      <TouchableOpacity style={tokenStyled.btnTrade} onPress={onPressTrade}>
        <Text style={tokenStyled.labelTrade}>Trade</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

const Token = (props) => {
  const { handleRemoveToken, swipable } = props;
  if (swipable === true) {
    return (
      <Swipeout
        autoClose
        style={{
          backgroundColor: 'transparent',
          paddingBottom: 28
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
        <TokenDefault {...props} />
      </Swipeout>
    );
  }
  return (
    <View style={{ paddingBottom: 28 }}>
      <TokenDefault {...props} />
    </View>
  );
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
  swipable: false,
  handleRemoveToken: null
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
  handleRemoveToken: PropTypes.func,
};
TokenDefault.propTypes = {
  symbol: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  priceUsd: PropTypes.number.isRequired,
  amount: PropTypes.number.isRequired,
  pDecimals: PropTypes.string.isRequired,
  decimalDigits: PropTypes.string.isRequired,
  pricePrv: PropTypes.string.isRequired,
  change: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  isGettingBalance: PropTypes.bool.isRequired,
  showGettingBalance: PropTypes.bool.isRequired,
};

export default withToken(memo(Token));
