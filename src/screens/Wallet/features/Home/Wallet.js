import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import Header from '@src/components/Header';
import { BtnSelectAccount } from '@screens/SelectAccount';
import { ButtonBasic, BtnQRCode, BtnClose } from '@src/components/Button';
import { tokenSeleclor } from '@src/redux/selectors';
import { useSelector, useDispatch } from 'react-redux';
import Token from '@src/components/Token';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { CONSTANT_COMMONS } from '@src/constants';
import {
  totalShieldedTokensSelector,
  isGettingBalance as isGettingTotalBalanceSelector,
} from '@src/redux/selectors/shared';
import { Amount } from '@src/components/Token/Token';
import { shieldStorageSelector } from '@src/screens/Shield/Shield.selector';
import { actionToggleGuide } from '@src/screens/Shield/Shield.actions';
import Tooltip from '@src/components/Tooltip/Tooltip';
import { COLORS } from '@src/styles';
import isNaN from 'lodash/isNaN';
import { TouchableOpacity } from '@src/components/core';
import {
  styled,
  styledHook,
  styledBalance,
  styledAddToken,
  styledFollow,
  extraStyled,
  styledToken,
  rightHeaderStyled,
} from './Wallet.styled';
import withWallet, { WalletContext } from './Wallet.enhance';

const GroupButton = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { guide } = useSelector(shieldStorageSelector);
  const handleShield = async () => {
    navigation.navigate(routeNames.Shield);
    if (!guide) {
      await dispatch(actionToggleGuide());
    }
  };
  return (
    <View
      style={[
        styled.groupButtonContainer,
        !guide ? styled.guide : null,
        styled.hook,
      ]}
    >
      {!guide && (
        <Tooltip
          content={<Hook />}
          containerStyle={{
            backgroundColor: COLORS.black,
            borderRadius: 11,
            marginBottom: 20,
          }}
          triangleStyle={{
            bottom: -30,
            left: '48%',
            borderBottomColor: COLORS.black,
          }}
        />
      )}
      <View style={styled.groupButton}>
        <ButtonBasic
          title="Shield my crypto"
          btnStyle={[styled.btnStyle]}
          titleStyle={[styled.titleStyle]}
          onPress={handleShield}
        />
      </View>
    </View>
  );
};

const Hook = () => {
  const dispatch = useDispatch();
  const { guide } = useSelector(shieldStorageSelector);
  const handleCloseShield = async () => {
    if (!guide) {
      await dispatch(actionToggleGuide());
    }
  };
  return (
    <View style={styledHook.container}>
      <View style={styledHook.btnClose}>
        <BtnClose size={20} onPress={handleCloseShield} />
      </View>
      <Text style={styledHook.title}>Transact without a trace.</Text>
      <Text style={styledHook.desc}>
        {
          'Shield any amount of any cryptocurrency.\nTurn your public coins into privacy coins.'
        }
      </Text>
    </View>
  );
};

const Balance = () => {
  let totalShielded = useSelector(totalShieldedTokensSelector);
  const isGettingTotalBalance =
    useSelector(isGettingTotalBalanceSelector).length > 0;
  if (isNaN(totalShielded)) {
    totalShielded = 0;
  }
  return (
    <View style={[styledBalance.container, styled.hook]}>
      <Amount
        amount={totalShielded}
        pDecimals={CONSTANT_COMMONS.PRV.pDecimals}
        showSymbol={false}
        isGettingBalance={isGettingTotalBalance}
        showGettingBalance
        customStyle={styledBalance.balance}
        hasPSymbol
        stylePSymbol={styledBalance.pSymbol}
        containerStyle={styledBalance.balanceContainer}
        size="large"
      />
      <Text style={styledBalance.title}>Shielded Balance</Text>
    </View>
  );
};

const FollowToken = () => {
  const followed = useSelector(tokenSeleclor.tokensFollowedSelector);
  const { walletProps } = React.useContext(WalletContext);
  const { handleSelectToken, handleRemoveToken } = walletProps;
  return (
    <View style={styledFollow.container}>
      <Token
        tokenId={CONSTANT_COMMONS.PRV_TOKEN_ID}
        style={[
          styledFollow.token,
          followed.length === 0 && styledToken.lastChild,
        ]}
        onPress={() => handleSelectToken(CONSTANT_COMMONS.PRV_TOKEN_ID)}
        showGettingBalance
      />
      {followed.map((token, index) => (
        <Token
          key={token?.id}
          tokenId={token?.id}
          style={[
            styledFollow.token,
            followed.length - 1 === index && styledToken.lastChild,
          ]}
          onPress={() => handleSelectToken(token?.id)}
          handleRemoveToken={() => handleRemoveToken(token?.id)}
          swipable
          removable
          showGettingBalance
        />
      ))}
    </View>
  );
};

const AddToken = () => {
  const navigation = useNavigation();
  const handleFollowToken = () => navigation.navigate(routeNames.FollowToken);
  return (
    <TouchableOpacity onPress={handleFollowToken}>
      <View style={[styledAddToken.container, styled.hook]}>
        <Text style={styledAddToken.title}>Add a coin +</Text>
      </View>
    </TouchableOpacity>
  );
};

const Extra = () => {
  const { walletProps } = React.useContext(WalletContext);
  const { isReloading, fetchData } = walletProps;
  return (
    <View style={extraStyled.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isReloading}
            onRefresh={() => fetchData(true)}
          />
        }
      >
        <Balance />
        <GroupButton />
        <FollowToken />
        <AddToken />
      </ScrollView>
    </View>
  );
};

const RightHeader = () => {
  const { walletProps } = React.useContext(WalletContext);
  const { handleExportKey } = walletProps;
  return (
    <View style={rightHeaderStyled.container}>
      <BtnQRCode
        style={rightHeaderStyled.btnExportKey}
        onPress={handleExportKey}
      />
      <BtnSelectAccount />
    </View>
  );
};

const Wallet = () => {
  const navigation = useNavigation();
  const onGoBack = () => navigation.navigate(routeNames.Home);
  return (
    <View style={[styled.container]}>
      <Header
        title="Assets"
        rightHeader={<RightHeader />}
        style={styled.hook}
        onGoBack={onGoBack}
      />
      <Extra />
    </View>
  );
};

Wallet.propTypes = {};

export default withWallet(Wallet);
