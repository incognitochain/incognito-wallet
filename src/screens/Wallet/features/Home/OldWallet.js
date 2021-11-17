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
  ScrollView,
  TouchableOpacity,
  Image,
  Toast,
} from '@src/components/core';
import useFeatureConfig from '@src/shared/hooks/featureConfig';
import { PRV } from '@services/wallet/tokenService';
import SelectAccountButton from '@components/SelectAccountButton';
import PropTypes from 'prop-types';
import { hideWalletBalanceSelector } from '@src/screens/Setting/Setting.selector';
import { actionUpdateShowWalletBalance } from '@src/screens/Setting/Setting.actions';
import srcHideBalanceIcon from '@src/assets/images/icons/ic_hide_blance.png';
import srcShowBalanceIcon from '@src/assets/images/icons/ic_show_blacne.png';
import appConstant from '@src/constants/app';
import StreamLineBottomBar from '@screens/Streamline/features/StreamLineBottomBar';
import { actionRemoveFollowToken } from '@src/redux/actions/token';
import { setSelectedPrivacy } from '@src/redux/actions/selectedPrivacy';
import {
  styled,
  styledHook,
  styledBalance,
  styledAddToken,
  styledFollow,
  extraStyled,
  styledToken,
  rightHeaderStyled,
} from './_Wallet.styled';
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
  const [onFeaturePress, isDisabled] = useFeatureConfig(
    appConstant.DISABLED.SHIELD,
    handleShield,
  );
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
  const { hideBalance, onPressHideBalance } = props;
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
        hideBalance={hideBalance}
        fromBalance
      />
      <View style={styled.contentShieldBalance}>
        <Text style={styledBalance.title}>Shielded Balance</Text>
        <Image
          source={hideBalance ? srcHideBalanceIcon : srcShowBalanceIcon}
          style={styled.iconHide}
        />
        <TouchableOpacity
          style={styled.btnHideBalance}
          onPress={onPressHideBalance}
        />
      </View>
    </View>
  );
});

Balance.defaultProps = {
  hideBalance: false,
  onPressHideBalance: null,
};

Balance.propTypes = {
  hideBalance: PropTypes.bool,
  onPressHideBalance: PropTypes.func,
};

const FollowToken = React.memo((props) => {
  const { hideBalance } = props;
  const followed = useSelector(tokenSelector.tokensFollowedSelector);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { walletProps } = React.useContext(WalletContext);
  const { isReloading, onRefresh } = walletProps;
  const handleSelectToken = async (tokenId) => {
    if (!tokenId) return;
    await dispatch(setSelectedPrivacy(tokenId));
    navigation.navigate(routeNames.WalletDetail);
  };
  const handleRemoveToken = async (tokenId) => {
    await dispatch(actionRemoveFollowToken(tokenId));
    Toast.showSuccess('Add coin again to restore balance.', {
      duration: 500,
    });
  };
  return (
    <View style={styledFollow.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={(
          <RefreshControl
            refreshing={isReloading}
            onRefresh={() => onRefresh(true)}
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
          hideBalance={hideBalance}
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
            hideBalance={hideBalance}
          />
        ))}
        <AddToken />
      </ScrollView>
    </View>
  );
});

FollowToken.defaultProps = {
  hideBalance: false,
};

FollowToken.propTypes = {
  hideBalance: PropTypes.bool,
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

const Extra = React.memo(() => {
  const dispatch = useDispatch();
  const showWalletBalance = useSelector(hideWalletBalanceSelector);
  const updateShowWalletBalance = () => {
    dispatch(actionUpdateShowWalletBalance());
  };

  return (
    <View style={extraStyled.container}>
      <Balance
        hideBalance={showWalletBalance}
        onPressHideBalance={updateShowWalletBalance}
      />
      <GroupButton />
      <FollowToken hideBalance={showWalletBalance} />
    </View>
  );
});

const RightHeader = React.memo(() => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const handleExportKey = async () => {
    navigation.navigate(routeNames.ReceiveCrypto);
    await dispatch(setSelectedPrivacy(CONSTANT_COMMONS.PRV.id));
  };
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

const OldWallet = React.memo(({ hideBackButton }) => {
  const navigation = useNavigation();
  const onGoBack = () => navigation.navigate(routeNames.MainTabBar);
  return (
    <View style={[styled.container, { backgroundColor: COLORS.white }]}>
      <Header
        title="Assets"
        hideBackButton={hideBackButton}
        rightHeader={<RightHeader />}
        style={styled.hook}
        onGoBack={onGoBack}
      />
      <Extra />
      <StreamLineBottomBar />
    </View>
  );
});

OldWallet.defaultProps = {
  hideBackButton: false,
};

OldWallet.propTypes = {
  hideBackButton: PropTypes.bool,
};

export default withWallet(OldWallet);
