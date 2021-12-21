import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
  actionUpdateShowWalletBalance,
  hideWalletBalanceSelector,
} from '@screens/Setting';
import {
  styledBalance,
  groupButtonStyled,
} from '@screens/Wallet/features/Home/Wallet.styled';
import {
  isGettingBalance as isGettingTotalBalanceSelector,
  totalShieldedTokensSelector,
} from '@src/redux/selectors/shared';
import isNaN from 'lodash/isNaN';
import { Amount } from '@components/Token/Token';
import { PRV } from '@services/wallet/tokenService';
import { BtnPrimary } from '@components/core/Button';
import { useNavigation } from 'react-navigation-hooks';
import { shieldStorageSelector } from '@screens/Shield/Shield.selector';
import routeNames from '@routers/routeNames';
import { actionToggleGuide } from '@screens/Shield/Shield.actions';
import useFeatureConfig from '@src/shared/hooks/featureConfig';
import appConstant from '@src/constants/app';
import Tooltip from '@components/Tooltip/Tooltip';
import { BtnClose } from '@components/Button';
import { Text3 } from '@components/core/Text';
import globalStyled from '@src/theme/theme.styled';
import { View } from '@components/core';
import { Row } from '@src/components';
import AddToken from '@screens/Wallet/features/Home/Wallet.addToken';

const Balance = React.memo(({ hideBalance }) => {
  let totalShielded = useSelector(totalShieldedTokensSelector);
  const isGettingTotalBalance =
    useSelector(isGettingTotalBalanceSelector).length > 0;
  if (isNaN(totalShielded)) {
    totalShielded = 0;
  }
  return (
    <View style={[styledBalance.container]}>
      <Row centerVertical spaceBetween>
        <Text3 style={styledBalance.title}>Coin balance</Text3>
        <AddToken />
      </Row>
      <Row style={styledBalance.wrapBalance} center>
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
      </Row>
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
    <View style={groupButtonStyled.wrapHook}>
      <View style={groupButtonStyled.btnClose}>
        <BtnClose size={20} onPress={handleCloseShield} />
      </View>
      <Text3 style={groupButtonStyled.title}>
        {'Turn your public coins into\nprivacy coins.'}
      </Text3>
      <Text3 style={groupButtonStyled.desc}>
        Enter the Incognito network and transact without a trace.
      </Text3>
    </View>
  );
});

const GroupButton = React.memo(() => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { guide } = useSelector(shieldStorageSelector);
  const handleShield = async () => {
    if (isDisabled) return;
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
    <View style={groupButtonStyled.container}>
      {/*{!guide && (*/}
      {/*  <Tooltip*/}
      {/*    content={<Hook />}*/}
      {/*    containerStyle={groupButtonStyled.tooltip}*/}
      {/*    triangleStyle={groupButtonStyled.triangleStyle}*/}
      {/*  />*/}
      {/*)}*/}
      <BtnPrimary onPress={onFeaturePress} title="Shield" />
    </View>
  );
});

const Extra = () => {
  const dispatch = useDispatch();
  const hideBalance = useSelector(hideWalletBalanceSelector);
  const updateShowBalance = () => dispatch(actionUpdateShowWalletBalance());
  return (
    <View style={[globalStyled.defaultPaddingHorizontal]}>
      <Balance
        hideBalance={hideBalance}
        onPressHideBalance={updateShowBalance}
      />
      <GroupButton />
    </View>
  );
};

Balance.propTypes = {
  hideBalance: PropTypes.bool.isRequired,
};

export default memo(Extra);
