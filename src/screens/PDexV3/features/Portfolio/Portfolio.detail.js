import React, {memo} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
} from 'react-native';
import {COLORS, FONT} from '@src/styles';
import {batch, useDispatch, useSelector} from 'react-redux';
import {
  getDataByShareIdSelector,
} from '@screens/PDexV3/features/Portfolio/Portfolio.selector';
import {Hook} from '@screens/Wallet/features/TxHistoryDetail/TxHistoryDetail';
import {liquidityActions} from '@screens/PDexV3/features/Liquidity';
import {useNavigation} from 'react-navigation-hooks';
import routeNames from '@routers/routeNames';
import {Row} from '@src/components';
import {actionToggleModal} from '@components/Modal';
import {BTNBorder, BTNPrimary} from '@components/core/Button';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  },
  content: {
    flex: 1
  },
  title: {
    ...FONT.STYLE.medium,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 9,
    color: '#101111',
  },
  btnText: {
    ...FONT.STYLE.medium,
    color: COLORS.lightGrey34,
    fontSize: FONT.SIZE.small,
  },
  btnSmall: {
    height: 28,
    width: 125,
    marginLeft: 5,
    borderRadius: 14,
    backgroundColor: COLORS.lightGrey19
  },
  row: {
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  warning: {
    color: COLORS.orange,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 9,
    fontFamily: FONT.NAME.medium,
  },
  leftText: {
    color: COLORS.lightGrey34,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 7,
    fontFamily: FONT.NAME.medium,
  },
  rightText: {
    color: COLORS.black,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 7,
    fontFamily: FONT.NAME.medium,
  },
  wrapHook: {
    marginTop: 8
  }
});

const PortfolioModal = ({ shareId, onWithdrawFeeLP }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const data = useSelector(getDataByShareIdSelector)(shareId);
  const onClose = () => dispatch(actionToggleModal());
  const onWithdrawPress = () => {
    batch(() => {
      onClose();
      dispatch(liquidityActions.actionSetRemovePoolToken({ inputToken: token1.tokenId, outputToken: token2.tokenId }));
      dispatch(liquidityActions.actionSetRemoveShareID(data.shareId));
      navigation.navigate(routeNames.RemovePool);
    });
  };
  const onInvestPress = () => {
    batch(() => {
      onClose();
      dispatch(liquidityActions.actionSetContributeID({ poolId: data.poolId, nftId: data.nftId || '' }));
      navigation.navigate(routeNames.ContributePool);
    });
  };
  const onClaimReward = () => {
    onClose();
    setTimeout(() => {
      onWithdrawFeeLP({ poolId: data.poolId, shareId });
    }, 500);
  };
  if (!data) return null;
  const { withdrawable, withdrawing, validNFT, disableBtn, share } = data;
  const { hookFactoriesDetail, token1, token2 } = data || {};
  return (
    <View style={styles.wrapper}>
      <View style={styles.content}>
        <Row style={styles.row} centerVertical>
          <Text style={styles.title}>{`${token1.symbol} / ${token2.symbol}`}</Text>
          <BTNPrimary
            title="Remove liquidity"
            textStyle={styles.btnText}
            wrapperStyle={styles.btnSmall}
            onPress={onWithdrawPress}
            disabled={disableBtn || !share}
          />
        </Row>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {hookFactoriesDetail.map((hook) => (
            <Hook key={hook?.label} {...hook} labelStyle={styles.leftText} valueTextStyle={styles.rightText} style={styles.wrapHook} />
          ))}
        </ScrollView>
        {!validNFT && <Text style={styles.warning}>You don&apos;t have any spare tickets to make this transaction. Wait for one to free up, or mint another.</Text>}
        <Row spaceBetween style={{ marginTop: 10 }}>
          {!!withdrawable && (
            <BTNBorder
              title="Withdraw rewards"
              onPress={onClaimReward}
              wrapperStyle={[{flex: 1}, !!share && { marginRight: 8 }]}
              textStyle={{color: COLORS.colorBlue}}
              background={COLORS.colorBlue}
              disabled={withdrawing || disableBtn}
            />
          )}
          {!!share && (
            <BTNPrimary
              title="Invest more"
              onPress={onInvestPress}
              wrapperStyle={{flex: 1}}
              background={COLORS.colorBlue}
            />
          )}
        </Row>
      </View>
    </View>
  );
};

PortfolioModal.propTypes = {
  shareId: PropTypes.string.isRequired,
  onWithdrawFeeLP: PropTypes.func.isRequired
};

export default memo(PortfolioModal);
