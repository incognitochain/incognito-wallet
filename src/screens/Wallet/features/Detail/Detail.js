import React from 'react';
import { View } from 'react-native';
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
  AmountBaseUSDT,
  ChangePrice,
} from '@src/components/Token/Token';
import HistoryToken from '@screens/Wallet/features/HistoryToken';
import MainCryptoHistory from '@screens/Wallet/features/MainCryptoHistory';
import { isGettingBalance as isGettingTokenBalanceSelector } from '@src/redux/selectors/token';
import { isGettingBalance as isGettingMainCryptoBalanceSelector } from '@src/redux/selectors/account';
import { useBtnTrade } from '@src/components/UseEffect/useBtnTrade';
import useFeatureConfig from '@src/shared/hooks/featureConfig';
import withDetail from './Detail.enhance';
import {
  styled,
  groupBtnStyled,
  balanceStyled,
  historyStyled,
} from './Detail.styled';

const GroupButton = React.memo(() => {
  const navigation = useNavigation();
  const handleSend = () => navigation.navigate(routeNames.Send);
  const handleReceive = () => navigation.navigate(routeNames.ReceiveCrypto);
  const [onPressSend, isSendDisabled] = useFeatureConfig('send', handleSend);
  return (
    <View style={groupBtnStyled.groupButton}>
      <ButtonBasic
        title="Send"
        btnStyle={groupBtnStyled.btnStyle}
        titleStyle={groupBtnStyled.titleStyle}
        onPress={onPressSend}
        disabled={isSendDisabled}
      />
      <ButtonBasic
        title="Receive"
        btnStyle={groupBtnStyled.btnStyle}
        titleStyle={groupBtnStyled.titleStyle}
        onPress={handleReceive}
      />
    </View>
  );
});

const Balance = React.memo(() => {
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
  const amountBaseUSDTProps = {
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
        <AmountBaseUSDT {...amountBaseUSDTProps} />
        <ChangePrice {...changePriceProps} />
      </View>
    </View>
  );
});

const History = React.memo(() => {
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  return (
    <View style={historyStyled.container}>
      {selectedPrivacy?.isMainCrypto ? <MainCryptoHistory /> : <HistoryToken />}
    </View>
  );
});

const Detail = (props) => {
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
  const [BtnTrade, hasTradeBtn] = useBtnTrade();
  return (
    <View style={styled.container}>
      <Header
        title={selected?.name}
        customHeaderTitle={<BtnInfo />}
        rightHeader={<BtnTrade />}
        onGoBack={onGoBack}
        styledContainerHeaderTitle={
          hasTradeBtn && styled.styledContainerHeaderTitle
        }
      />
      <Balance />
      <GroupButton />
      <History {...{ ...props, refreshing }} />
    </View>
  );
};

Detail.propTypes = {};

History.propTypes = {};

export default withDetail(React.memo(Detail));
