import React from 'react';
import { View, Text, RefreshControl } from 'react-native';
import Header from '@src/components/Header';
import { ButtonBasic, BtnQRCode, BtnClose } from '@src/components/Button';
import { tokenSelector } from '@src/redux/selectors';
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
import {
  BottomBar,
  ScrollView,
  TouchableOpacity,
  Image,
} from '@src/components/core';
import useFeatureConfig from '@src/shared/hooks/featureConfig';
import { useStreamLine } from '@src/screens/Streamline';
import { PRV } from '@services/wallet/tokenService';
import SelectAccountButton from '@components/SelectAccountButton';
import PropTypes from 'prop-types';
import { showWalletBlanceSelector } from '@src/screens/Setting/Setting.selector';
import { actionUpdateShowWalletBlance } from '@src/screens/Setting/Setting.actions';
import srcHideBlanceIcon from '@src/assets/images/icons/ic_hide_blance.png';
import srcShowBlanceIcon from '@src/assets/images/icons/ic_show_blance.png';
import appConstant from '@src/constants/app';
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

const GroupButton = React.memo(() => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { guide } = useSelector(shieldStorageSelector);
  const handleShield = async () => {
    navigation.navigate(routeNames.Shield);
    if (!guide) {
      await dispatch(actionToggleGuide());
    }
  };
  const [onFeaturePress, isDisabled] = useFeatureConfig(appConstant.DISABLED.SHIELD, handleShield);
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
          onPress={onFeaturePress}
          disabled={isDisabled}
        />
      </View>
    </View>
  );
});

const Hook = React.memo(() => {
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
      <Text style={styledHook.title}>
        {'Turn your public coins into\nprivacy coins.'}
      </Text>
      <Text style={styledHook.desc}>
        Enter the Incognito network and transact without a trace.
      </Text>
    </View>
  );
});

const Balance = React.memo((props) => {
  const { hideBlance, onPressHideBlance } = props;
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
        pDecimals={PRV.pDecimals}
        showSymbol={false}
        isGettingBalance={isGettingTotalBalance}
        customStyle={styledBalance.balance}
        hasPSymbol
        stylePSymbol={styledBalance.pSymbol}
        containerStyle={styledBalance.balanceContainer}
        size="large"
        hideBlance={hideBlance}
        fromBlance
      />
      <View style={styled.contentShieldBlance}>
        <Text style={styledBalance.title}>Shielded Balance</Text>
        <Image source={hideBlance ? srcHideBlanceIcon : srcShowBlanceIcon} style={styled.iconHide} />
        <TouchableOpacity
          style={styled.btnHideBlance}
          onPress={onPressHideBlance}
        />
      </View>
    </View>
  );
});

Balance.defaultProps = {
  hideBlance: false,
  onPressHideBlance: null,
};

Balance.propTypes = {
  hideBlance: PropTypes.bool,
  onPressHideBlance: PropTypes.func,
};

const FollowToken = React.memo((props) => {
  const { hideBlance } = props;
  const followed = useSelector(tokenSelector.tokensFollowedSelector);
  const { walletProps } = React.useContext(WalletContext);
  const {
    handleSelectToken,
    handleRemoveToken,
    isReloading,
    fetchData,
  } = walletProps;
  return (
    <View style={styledFollow.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={(
          <RefreshControl
            refreshing={isReloading}
            onRefresh={() => fetchData(true)}
          />
        )}
        nestedScrollEnabled
      >
        <Token
          tokenId={CONSTANT_COMMONS.PRV_TOKEN_ID}
          style={[
            styledFollow.token,
            followed.length === 0 && styledToken.lastChild,
          ]}
          onPress={() => handleSelectToken(CONSTANT_COMMONS.PRV_TOKEN_ID)}
          hideBlance={hideBlance}
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
            showGettingBalance={token?.loading}
            hideBlance={hideBlance}
          />
        ))}
        <AddToken />
      </ScrollView>
    </View>
  );
});

FollowToken.defaultProps = {
  hideBlance: false,
};

FollowToken.propTypes = {
  hideBlance: PropTypes.bool,
};

const AddToken = React.memo(() => {
  const navigation = useNavigation();
  const handleFollowToken = () => navigation.navigate(routeNames.FollowToken);
  return (
    <TouchableOpacity onPress={handleFollowToken}>
      <View style={[styledAddToken.container, styled.hook]}>
        <Text style={styledAddToken.title}>Add a coin +</Text>
      </View>
    </TouchableOpacity>
  );
});

const StreamLine = React.memo(() => {
  const { hasExceededMaxInputPRV, onNavigateStreamLine } = useStreamLine();
  if (!hasExceededMaxInputPRV) {
    return null;
  }
  return (
    <BottomBar
      onPress={onNavigateStreamLine}
      text="Streamline this keychain now for efficient transactions"
    />
  );
});

const Extra = React.memo(() => {
  const dispatch = useDispatch();
  const showWalletBlance = useSelector(showWalletBlanceSelector);
  const updateShowWalletBlance = () => {
    dispatch(actionUpdateShowWalletBlance());
  };

  return (
    <View style={extraStyled.container}>
      <Balance hideBlance={showWalletBlance} onPressHideBlance={updateShowWalletBlance} />
      <GroupButton />
      <FollowToken hideBlance={showWalletBlance} />
      <StreamLine />
    </View>
  );
});

const RightHeader = React.memo(() => {
  const { walletProps } = React.useContext(WalletContext);
  const { handleExportKey } = walletProps;
  return (
    <View style={rightHeaderStyled.container}>
      <BtnQRCode
        style={rightHeaderStyled.btnExportKey}
        onPress={handleExportKey}
      />
      <SelectAccountButton />
    </View>
  );
});

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
