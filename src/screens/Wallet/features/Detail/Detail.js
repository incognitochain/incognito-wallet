import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import Header from '@src/components/Header';
import {
  selectedPrivacySeleclor,
  sharedSeleclor,
  tokenSeleclor,
} from '@src/redux/selectors';
import { useSelector, useDispatch } from 'react-redux';
import { ButtonBasic } from '@src/components/Button';
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
import { actionFetch as fetchDataShield } from '@screens/Shield/Shield.actions';
import { ExHandler } from '@src/services/exception';
import { CONSTANT_COMMONS } from '@src/constants';
import withDetail from './Detail.enhance';
import {
  styled,
  groupBtnStyled,
  balanceStyled,
  historyStyled,
} from './Detail.styled';

const RightHeader = () => {
  const navigation = useNavigation();
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  if (
    !selectedPrivacy?.pairWithPrv ||
    selectedPrivacy?.tokenId === CONSTANT_COMMONS.PRV.id
  ) {
    return null;
  }
  return (
    <ButtonBasic
      title="Trade"
      btnStyle={styled.btnTrade}
      titleStyle={styled.titleBtnTrade}
      onPress={() =>
        navigation.navigate(routeNames.Dex, {
          inputTokenId: CONSTANT_COMMONS.PRV.id,
          outputTokenId: selectedPrivacy?.tokenId,
        })
      }
    />
  );
};

const GroupButton = () => {
  const selected = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const handleSend = () => navigation.navigate(routeNames.Send);
  const handleShield = async () => {
    try {
      navigation.navigate(routeNames.ShieldGenQRCode);
      await dispatch(fetchDataShield({ tokenId: selected?.tokenId }));
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  const handleReceive = () => navigation.navigate(routeNames.ReceiveCrypto);
  return (
    <View style={groupBtnStyled.groupButton}>
      {selected?.isMainCrypto ? (
        <ButtonBasic
          title="Receive"
          btnStyle={groupBtnStyled.btnStyle}
          titleStyle={groupBtnStyled.titleStyle}
          onPress={handleReceive}
        />
      ) : selected?.isDeposable ? (
        <ButtonBasic
          title="Shield"
          btnStyle={groupBtnStyled.btnStyle}
          titleStyle={groupBtnStyled.titleStyle}
          onPress={handleShield}
        />
      ) : (
        <ButtonBasic
          title="Receive"
          btnStyle={groupBtnStyled.btnStyle}
          titleStyle={groupBtnStyled.titleStyle}
          onPress={handleReceive}
        />
      )}
      <ButtonBasic
        title="Send"
        btnStyle={groupBtnStyled.btnStyle}
        titleStyle={groupBtnStyled.titleStyle}
        onPress={handleSend}
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

const History = () => {
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  return (
    <View style={historyStyled.container}>
      {selectedPrivacy?.isToken && <HistoryToken />}
      {selectedPrivacy?.isMainCrypto && <MainCryptoHistory />}
    </View>
  );
};

const Detail = props => {
  const { handleLoadHistory } = props;
  const selected = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const { isFetching } = useSelector(tokenSeleclor.historyTokenSelector);
  return (
    <View style={styled.container}>
      <Header title={selected?.name} rightHeader={<RightHeader />} />
      <ScrollView
        contentContainerStyle={styled.scrollview}
        showsVerticalScrollIndicator={false}
        refreshControl={(
          <RefreshControl
            refreshing={isFetching}
            onRefresh={handleLoadHistory}
          />
        )}
      >
        <Balance />
        <GroupButton />
        <History />
      </ScrollView>
    </View>
  );
};

Detail.propTypes = {
  handleLoadHistory: PropTypes.func.isRequired,
};

export default withDetail(Detail);
