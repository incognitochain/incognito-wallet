import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import {useDispatch} from 'react-redux';
import {actionGetPDexV3Inst} from '@screens/PDexV3';
import {ExHandler} from '@services/exception';
import LoadingTx from '@components/LoadingTx/LoadingTx';

const withTransaction = WrappedComp => props => {
  const dispatch = useDispatch();
  const [error, setError] = React.useState('');
  const [loadingTx, setLoadingTx] = React.useState(false);
  const onStaking = async ({ fee, tokenID, tokenAmount, nftID }) => {
    if (loadingTx) return;
    try {
      setLoadingTx(true);
      const pDexV3Inst = await dispatch(actionGetPDexV3Inst());
      await pDexV3Inst.stakeCreateRequestTx({ fee, tokenID, tokenAmount, nftID });
    } catch (error) {
      setError(new ExHandler(error).getMessage(error?.message));
    } finally {
      setLoadingTx(false);
    }
  };

  const onUnStaking = async (withdrawCoins) => {
    if (loadingTx) return;
    try {
      setLoadingTx(true);
      const pDexV3Inst = await dispatch(actionGetPDexV3Inst());
      for (const item of withdrawCoins) {
        await pDexV3Inst.stakeWithdrawRequestTx({...item});
      }
    } catch (error) {
      setError(new ExHandler(error).getMessage(error?.message));
    } finally {
      setLoadingTx(false);
    }
  };

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          onStaking,
          onUnStaking,
          error,
        }}
      />
      {loadingTx && <LoadingTx />}
    </ErrorBoundary>
  );
};

export default withTransaction;