import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, BaseTextInput, RoundCornerButton } from '@components/core';
import mainStyle from '@screens/Dex/style';
import { compose } from 'recompose';
import { withLayout_2 } from '@components/Layout/index';
import ExtraInfo from '@screens/DexV2/components/ExtraInfo';
import withChangeInput from '@screens/DexV2/components/Trade/input.enhance';
import withValidate from '@screens/DexV2/components/Trade/validate.enhance';
import { useNavigation } from 'react-navigation-hooks';
import ROUTE_NAMES from '@routers/routeNames';
import { Header, Row } from '@src/components/';
import { BtnInfinite } from '@components/Button/index';
import convertUtil from '@utils/convert';
import formatUtil from '@utils/format';
import withCoinData from '@screens/Dex/InvestBalance/TopUp/Input/coin.enhance';
import withDefaultAccount from '@components/Hoc/withDefaultAccount';
import Balance from '@screens/DexV2/components/Balance';
import styles from './style';

const TopUp = ({
  coin,
  inputValue,
  inputText,
  onChangeInputText,
  feeToken,
  prvBalance,
  fee,
  error,
  account,
}) => {
  const navigation = useNavigation();

  const handleTopUp = () => {
    navigation.navigate(ROUTE_NAMES.InvestTopUpConfirm, {
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
      <Header title={`Top up ${coin.symbol}`} />
      <View style={mainStyle.coinContainer}>
        <Row center spaceBetween style={styles.inputContainer}>
          <BaseTextInput
            style={styles.input}
            placeholder="0"
            onChangeText={onChangeInputText}
            value={inputText}
          />
          <BtnInfinite
            style={styles.symbol}
            onPress={handleMax}
          />
        </Row>
        <Text style={mainStyle.error}>{error}</Text>

        <ExtraInfo style={mainStyle.info} left="To" right="pDEX" />
        <ExtraInfo style={mainStyle.info} left="From" right={account.name || account.AccountName} />
        <Balance style={mainStyle.info} balance={fee} title="Fee" token={feeToken} />
        <RoundCornerButton
          title="Preview top up"
          style={[mainStyle.button, styles.button]}
          onPress={handleTopUp}
          disabled={!!error || !inputText}
        />
        <Balance balance={coin.balance} token={coin} hideRightSymbol />
      </View>
    </View>
  );
};

TopUp.propTypes = {
  coin: PropTypes.object.isRequired,
  inputValue: PropTypes.number,
  inputText: PropTypes.string,
  onChangeInputText: PropTypes.func,
  prvBalance: PropTypes.number,
  fee: PropTypes.number,
  feeToken: PropTypes.object,
  error: PropTypes.string,
  account: PropTypes.object.isRequired,
};

TopUp.defaultProps = {
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
  withDefaultAccount,
)(TopUp);

