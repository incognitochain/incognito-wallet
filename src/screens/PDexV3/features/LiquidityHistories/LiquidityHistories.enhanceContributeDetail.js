import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import {actionGetPDexV3Inst} from '@screens/PDexV3';
import {batch, useDispatch} from 'react-redux';
import {ExHandler} from '@services/exception';
import Loading from '@screens/Dex/components/Loading';
import {SUCCESS_MODAL} from '@screens/PDexV3/features/Liquidity';
import {SuccessModal} from '@src/components';
import {liquidityHistoryActions} from '@screens/PDexV3/features/LiquidityHistories/index';
import {actionSetNFTTokenData} from '@src/redux/actions/account';
import {useNavigation} from 'react-navigation-hooks';
import routeNames from '@routers/routeNames';

const withContributeDetail = WrappedComp => props => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [loading, setLoading] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const onSuccess = () => {
    setTimeout(() => { setVisible(true); }, 500);
  };
  const onClose = () => {
    setVisible(false);
    batch(() => {
      dispatch(liquidityHistoryActions.actionGetHistories());
      dispatch(actionSetNFTTokenData());
    });
    setTimeout(() => { navigation.navigate(routeNames.LiquidityHistories); }, 500);
  };
  const handleRefund = async ({ fee, tokenID, poolPairID, pairHash, nftID, amplifier }) => {
    if (loading) return;
    setLoading(true);
    try {
      const pDexV3Inst = await dispatch(actionGetPDexV3Inst());
      await pDexV3Inst.createAndSendContributeRequestTx({
        transfer: { fee, tokenID },
        extra: {
          poolPairID,
          pairHash,
          contributedAmount: String(1),
          nftID,
          amplifier,
        },
      });
      onSuccess();
    } catch (error) {
      new ExHandler(error).showErrorToast();
    } finally {
      setLoading(false);
    }
  };
  const handleRetry = async ({ fee, tokenID, poolPairID, pairHash, nftID, amplifier, amount }) => {
    if (loading) return;
    setLoading(true);
    try {
      const pDexV3Inst = await dispatch(actionGetPDexV3Inst());
      await pDexV3Inst.createAndSendContributeRequestTx({
        transfer: { fee, tokenID },
        extra: {
          poolPairID,
          pairHash,
          contributedAmount: String(amount),
          nftID,
          amplifier,
        },
      });
      onSuccess();
    } catch (error) {
      new ExHandler(error).showErrorToast();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          handleRefund,
          handleRetry,
        }}
      />
      <Loading open={loading} />
      <SuccessModal
        closeSuccessDialog={onClose}
        title={SUCCESS_MODAL.ADD_POOL.title}
        buttonTitle="Ok"
        description={SUCCESS_MODAL.ADD_POOL.desc}
        visible={visible}
      />
    </ErrorBoundary>
  );
};

export default withContributeDetail;
