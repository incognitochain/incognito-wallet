import React, {memo} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
} from 'react-native';
import {COLORS, FONT} from '@src/styles';
import {batch, useDispatch, useSelector} from 'react-redux';
import {getDataShareByPoolIdSelector} from '@screens/PDexV3/features/Portfolio/Portfolio.selector';
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
    width: 89,
    marginLeft: 5,
    backgroundColor: COLORS.lightGrey19
  },
  row: {
    alignItems: 'center',
    justifyContent: 'space-between'
  }
});

const PortfolioModal = ({ poolId, onWithdrawFeeLP }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const data = useSelector(getDataShareByPoolIdSelector)(poolId);
  const onClose = () => dispatch(actionToggleModal());
  const onWithdrawPress = () => {
    batch(() => {
      onClose();
      dispatch(liquidityActions.actionSetRemovePoolToken({ inputToken: token1.tokenId, outputToken: token2.tokenId }));
      dispatch(liquidityActions.actionSetRemovePoolID(poolId));
      navigation.navigate(routeNames.RemovePool);
    });
  };
  const onInvestPress = () => {
    batch(() => {
      onClose();
      dispatch(liquidityActions.actionSetContributePoolID({ poolId }));
      navigation.navigate(routeNames.ContributePool);
    });
  };
  const onClaimReward = () => {
    onClose();
    setTimeout(() => {
      onWithdrawFeeLP(poolId);
    }, 500);
  };
  if (!data) return null;
  const { hookFactoriesDetail, token1, token2 } = data || {};
  return (
    <View style={styles.wrapper}>
      <View style={styles.content}>
        <Row style={styles.row} centerVertical>
          <Text style={styles.title}>{`${token1.symbol} / ${token2.symbol}`}</Text>
          <BTNPrimary
            title="Withdraw"
            textStyle={styles.btnText}
            wrapperStyle={styles.btnSmall}
            onPress={onWithdrawPress}
          />
        </Row>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {hookFactoriesDetail.map((hook) => (
            <Hook key={hook?.label} {...hook} />
          ))}
        </ScrollView>
        <Row spaceBetween>
          <BTNBorder
            title="Claim"
            onPress={onClaimReward}
            wrapperStyle={{flex: 1, marginRight: 4}}
            textStyle={{color: COLORS.colorBlue}}
            background={COLORS.colorBlue}
          />
          <BTNPrimary
            title="Invest more"
            onPress={onInvestPress}
            wrapperStyle={{flex: 1, marginLeft: 4}}
            background={COLORS.colorBlue}
          />
        </Row>
      </View>
    </View>
  );
};

PortfolioModal.propTypes = {
  poolId: PropTypes.string.isRequired,
  onWithdrawFeeLP: PropTypes.func.isRequired
};

export default memo(PortfolioModal);
