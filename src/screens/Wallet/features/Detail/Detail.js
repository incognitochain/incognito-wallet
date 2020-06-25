import React from 'react';
import { View, RefreshControl } from 'react-native';
import Header from '@src/components/Header';
import {
  selectedPrivacySeleclor,
  sharedSeleclor,
  tokenSeleclor,
  accountSeleclor,
} from '@src/redux/selectors';
import { useSelector } from 'react-redux';
import { ButtonBasic, BtnInfo } from '@src/components/Button';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import {
  Amount,
  AmountBasePRV,
  ChangePrice,
} from '@src/components/Token/Token';
import HistoryToken from '@screens/Wallet/features/HistoryToken';
import MainCryptoHistory from '@screens/Wallet/features/MainCryptoHistory';
import PropTypes from 'prop-types';
import { CONSTANT_COMMONS } from '@src/constants';
import { isGettingBalance as isGettingTokenBalanceSelector } from '@src/redux/selectors/token';
import { isGettingBalance as isGettingMainCryptoBalanceSelector } from '@src/redux/selectors/account';
import { ScrollView } from '@src/components/core';
import withDetail from './Detail.enhance';
import {
  styled,
  groupBtnStyled,
  balanceStyled,
  historyStyled,
} from './Detail.styled';

const RightHeader = ({ hasTradeBtn }) => {
  const navigation = useNavigation();
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  if (!hasTradeBtn) {
    return null;
  }
  return (
    <ButtonBasic
      title="Trade"
      btnStyle={styled.btnTrade}
      titleStyle={styled.titleBtnTrade}
      onPress={() =>
        navigation.navigate(routeNames.Trade, {
          inputTokenId: CONSTANT_COMMONS.PRV.id,
          outputTokenId: selectedPrivacy?.tokenId,
        })
      }
    />
  );
};

const GroupButton = () => {
  const navigation = useNavigation();
  const handleSend = () => navigation.navigate(routeNames.Send);
  const handleReceive = () => navigation.navigate(routeNames.ReceiveCrypto);
  return (
    <View style={groupBtnStyled.groupButton}>
      <ButtonBasic
        title="Send"
        btnStyle={groupBtnStyled.btnStyle}
        titleStyle={groupBtnStyled.titleStyle}
        onPress={handleSend}
      />
      <ButtonBasic
        title="Receive"
        btnStyle={groupBtnStyled.btnStyle}
        titleStyle={groupBtnStyled.titleStyle}
        onPress={handleReceive}
      />
    </View>
  );
};

const Balance = () => {
  const selected = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const isGettingBalance = useSelector(
    sharedSeleclor.isGettingBalance,
  ).includes(selected?.tokenId);
  const tokenData = {
    ...selected,
    isGettingBalance,
  };
  const amountProps = {
    customStyle: balanceStyled.amount,
    ...tokenData,
    showSymbol: false,
  };
  const amountBasePRVProps = {
    customStyle: balanceStyled.amountBasePRV,
    customPSymbolStyle: [balanceStyled.pSymbol],
    ...tokenData,
  };
  const changePriceProps = {
    customStyle: balanceStyled.changePrice,
    ...tokenData,
  };
  return (
    <View style={balanceStyled.container}>
      <Amount {...amountProps} />
      <View style={balanceStyled.hook}>
        <AmountBasePRV {...amountBasePRVProps} />
        <ChangePrice {...changePriceProps} />
      </View>
    </View>
  );
};

const History = (props) => {
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const { isFetching } = useSelector(tokenSeleclor.historyTokenSelector);
  const { handleLoadHistory } = props;
  return (
    <View style={historyStyled.container}>
      <ScrollView
        nestedScrollEnabled
        refreshControl={(
          <RefreshControl
            refreshing={isFetching}
            onRefresh={handleLoadHistory}
          />
        )}
      >
        {selectedPrivacy?.isToken && <HistoryToken />}
        {selectedPrivacy?.isMainCrypto && <MainCryptoHistory />}
      </ScrollView>
    </View>
  );
};

const Detail = (props) => {
  const { handleLoadHistory } = props;
  const navigation = useNavigation();
  const selected = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const { isFetching } = useSelector(tokenSeleclor.historyTokenSelector);
  const token = useSelector(
    selectedPrivacySeleclor.selectedPrivacyByFollowedSelector,
  );
  const isGettingTokenBalance = useSelector(isGettingTokenBalanceSelector);
  const isGettingMainCryptoBalance = useSelector(
    isGettingMainCryptoBalanceSelector,
  );
  const defaultAccount = useSelector(accountSeleclor.defaultAccountSelector);
  const refreshing =
    !!isFetching || selected?.isMainCrypto
      ? isGettingMainCryptoBalance.length > 0 || !defaultAccount
      : isGettingTokenBalance.length > 0 || !token;
  const onGoBack = () => navigation.navigate(routeNames.Wallet);
  const onNavTokenInfo = () => navigation.navigate(routeNames.CoinInfo);
  const hasTradeBtn =
    selected?.pairWithPrv && selected?.tokenId !== CONSTANT_COMMONS.PRV.id;

  return (
    <View style={styled.container}>
      <Header
        title={selected?.name}
        customHeaderTitle={
          <BtnInfo onPress={onNavTokenInfo} style={styled.btnInfo} />
        }
        rightHeader={<RightHeader hasTradeBtn={hasTradeBtn} />}
        onGoBack={onGoBack}
        styledContainerHeaderTitle={
          hasTradeBtn && styled.styledContainerHeaderTitle
        }
      />
      <ScrollView
        contentContainerStyle={{
          flex: 1,
        }}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleLoadHistory}
          />
        )}
        nestedScrollEnabled
      >
        <Balance />
        <GroupButton />
        <History {...{ ...props, refreshing }} />
      </ScrollView>
    </View>
  );
};

Detail.propTypes = {
  handleLoadHistory: PropTypes.func.isRequired,
};

History.propTypes = {
  handleLoadHistory: PropTypes.func.isRequired,
};

RightHeader.defaultProps = {
  hasTradeBtn: false,
};

RightHeader.propTypes = {
  hasTradeBtn: PropTypes.bool,
};

export default withDetail(Detail);
