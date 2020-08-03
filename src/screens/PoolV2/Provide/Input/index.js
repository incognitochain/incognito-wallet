import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, BaseTextInput, RoundCornerButton } from '@components/core';
import mainStyle from '@screens/PoolV2/style';
import { compose } from 'recompose';
import { withLayout_2 } from '@components/Layout/index';
import withCoinData from '@screens/PoolV2/Provide/Input/coin.enhance';
import ExtraInfo from '@screens/DexV2/components/ExtraInfo';
import withChangeInput from '@screens/DexV2/components/Trade/input.enhance';
import withValidate from '@screens/DexV2/components/Trade/validate.enhance';
import { useNavigation } from 'react-navigation-hooks';
import ROUTE_NAMES from '@routers/routeNames';
import { Header, Row } from '@src/components/';
import { BtnInfinite } from '@components/Button/index';
import convertUtil from '@utils/convert';
import formatUtil from '@utils/format';
import styles from './style';

const Provide = ({
  coin,
  inputValue,
  inputText,
  onChangeInputText,
  feeToken,
  prvBalance,
  fee,
  error,
}) => {
  const navigation = useNavigation();

  const handleProvide = () => {
    navigation.navigate(ROUTE_NAMES.PoolV2ProvideConfirm, {
      coin,
      value: inputValue,
      text: inputText,
      fee,
      feeToken,
      prvBalance,
    });
  };

  const handleMax = () => {
    const humanAmount = convertUtil.toHumanAmount(coin.balance, coin.pDecimals);
    const fixDecimals = formatUtil.toFixed(humanAmount, coin.pDecimals);
    onChangeInputText(fixDecimals.toString());
  };

  return (
    <View style={mainStyle.flex}>
      <Header title="Provide" />
      <View style={mainStyle.coinContainer}>
        <Row center spaceBetween style={mainStyle.inputContainer}>
          <BaseTextInput
            style={mainStyle.input}
            placeholder="0"
            onChangeText={onChangeInputText}
            value={inputText}
            keyboardType="decimal-pad"
          />
          <BtnInfinite
            style={mainStyle.symbol}
            onPress={handleMax}
          />
        </Row>
        <Text style={mainStyle.coinExtra}>{coin.displayInterest}</Text>
        <Text style={mainStyle.error}>{error}</Text>
        <RoundCornerButton
          title="Provide liquidity"
          style={[mainStyle.button, styles.button]}
          onPress={handleProvide}
          disabled={!!error || !inputText}
        />
        <ExtraInfo left="Balance" right={`${coin.displayFullBalance} ${coin.symbol}`} />
      </View>
    </View>
  );
};

Provide.propTypes = {
  coin: PropTypes.object.isRequired,
  inputValue: PropTypes.number,
  inputText: PropTypes.string,
  onChangeInputText: PropTypes.func,
  prvBalance: PropTypes.number,
  fee: PropTypes.number,
  feeToken: PropTypes.object,
  error: PropTypes.string,
};

Provide.defaultProps = {
  inputValue: 0,
  inputText: '',
  onChangeInputText: undefined,
  prvBalance: 0,
  fee: 0,
  feeToken: null,
  error: '',
};

export default compose(
  withLayout_2,
  withCoinData,
  withChangeInput,
  withValidate,
)(Provide);

