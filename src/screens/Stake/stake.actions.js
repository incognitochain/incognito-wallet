import {
  getEstimateFeeForNativeToken,
  getNodeTime,
} from '@src/services/wallet/RpcClientService';
import convert from '@src/utils/convert';
import {getSignPublicKey, signPoolWithdraw} from '@src/services/gomobile';
import {actionSendNativeToken} from '@src/redux/actions/account';
import {CONSTANT_COMMONS} from '@src/constants';
import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
  ACTION_CHANGE_FLOW_STEP,
  ACTION_CHANGE_FLOW_ACCOUNT,
  ACTION_CHANGE_FLOW_AMOUNT,
  ACTION_FETCHING_FEE,
  ACTION_FETCHED_FEE,
  ACTION_FETCH_FAIL_FEE,
  ACTION_FETCHING_CREATE_STAKE,
  ACTION_FETCHED_CREATE_STAKE,
  ACTION_FETCH_FAIL_CREATE_STAKE,
  ACTION_FETCHING_CREATE_UNSTAKE,
  ACTION_FETCHED_CREATE_UNSTAKE,
  ACTION_FETCH_FAIL_CREATE_UNSTAKE,
  ACTION_BACKUP_CREATE_STAKE,
} from './stake.constant';
import {
  apiGetMasterAddress,
  apiGetStakerInfo,
  apiCreateStake,
  apiUnStake,
} from './stake.services';
import {
  stakeSelector,
  pStakeAccountSelector,
  stakeDataSelector,
  activeFlowSelector,
  createUnStakeSelector,
  createStakeSelector,
  feeStakeSelector,
} from './stake.selector';
import {mappingData} from './stake.utils';

export const actionFetching = () => ({
  type: ACTION_FETCHING,
});

export const actionFetched = payload => ({
  type: ACTION_FETCHED,
  payload,
});

export const actionFetchFail = () => ({
  type: ACTION_FETCH_FAIL,
});

export const actionFetch = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const pStakeAccount = pStakeAccountSelector(state);
    const {isFetching} = stakeSelector(state);
    if (!pStakeAccount) {
      throw new Error('pStake account can\'t not found!');
    }
    if (isFetching) {
      return;
    }
    await dispatch(actionFetching());
    const [
      dataMasterAddress,
      dataStakerInfo,
      nodeTimeCurrent,
    ] = await new Promise.all([
      await apiGetMasterAddress(),
      await apiGetStakerInfo({paymentAddress: pStakeAccount?.PaymentAddress}),
      await getNodeTime(),
    ]);
    console.log(
      'dataMasterAddress',
      dataMasterAddress,
      'dataStakerInfo',
      dataStakerInfo,
    );
    const payload = mappingData(dataMasterAddress, dataStakerInfo);
    await dispatch(
      actionFetched({
        ...payload,
        nodeTime: nodeTimeCurrent * 1000,
        localTime: new Date().getTime(),
      }),
    );
  } catch (error) {
    await dispatch(actionFetchFail());
    throw new Error(error);
  }
};

export const actionChangeFLowStep = (
  payload = {activeFlow: 'deposit', step: 0},
) => ({
  type: ACTION_CHANGE_FLOW_STEP,
  payload,
});

export const actionChangeFlowAccount = (
  payload = {account: null, balancePStake: 0},
) => ({
  type: ACTION_CHANGE_FLOW_ACCOUNT,
  payload,
});

export const actionChangeFlowAmount = (payload = {amount: 0}) => ({
  type: ACTION_CHANGE_FLOW_AMOUNT,
  payload,
});

export const actionFetchingFee = () => ({
  type: ACTION_FETCHING_FEE,
});

export const actionFetchedFee = payload => ({
  type: ACTION_FETCHED_FEE,
  payload,
});

export const actionFetchFailFee = () => ({
  type: ACTION_FETCH_FAIL_FEE,
});

export const actionFetchFee = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const {from, to, walletAccount} = activeFlowSelector(state);
    const {pDecimals, maxToStake} = stakeDataSelector(state);
    const {isFetching} = feeStakeSelector(state);
    if (isFetching) {
      return;
    }
    await dispatch(actionFetchingFee());
    const amountConverted = convert.toOriginalAmount(
      convert.toHumanAmount(maxToStake, pDecimals),
      pDecimals,
    );
    const feeEst = await getEstimateFeeForNativeToken(
      from,
      to,
      amountConverted,
      walletAccount,
    );
    await dispatch(actionFetchedFee(feeEst));
  } catch (error) {
    await dispatch(actionFetchFailFee());
    throw new Error(error);
  }
};

export const actionBackupCreateStake = () => ({
  type: ACTION_BACKUP_CREATE_STAKE,
});

export const actionFetchingCreateStake = () => ({
  type: ACTION_FETCHING_CREATE_STAKE,
});

export const actionFetchedCreateStake = payload => ({
  type: ACTION_FETCHED_CREATE_STAKE,
  payload,
});

export const actionFetchFailCreateStake = () => ({
  type: ACTION_FETCH_FAIL_CREATE_STAKE,
});

export const actionFetchCreateStake = ({amount, fee}) => async (
  dispatch,
  getState,
) => {
  try {
    const state = getState();
    const {isFetching} = createStakeSelector(state);
    if (isFetching) {
      return;
    }
    const pStakeAccount = pStakeAccountSelector(state);
    const {account} = activeFlowSelector(state);
    const {stakingMasterAddress} = stakeDataSelector(state);
    await dispatch(actionFetchingCreateStake());
    const [tx, signPublicKeyEncode] = await new Promise.all([
      await dispatch(
        actionSendNativeToken({
          account,
          amount,
          fee,
          toAddress: stakingMasterAddress,
          pDecimals: CONSTANT_COMMONS.PRV.pDecimals,
        }),
      ),
      await getSignPublicKey(pStakeAccount?.PrivateKey),
    ]);
    if (!tx?.txId) {
      throw new Error('No txId');
    }
    const payload = await apiCreateStake({
      PStakeAddress: pStakeAccount?.PaymentAddress,
      SignPublicKeyEncode: signPublicKeyEncode,
      IncognitoTx: tx?.txId,
    });
    if (payload?.ID) {
      return await new Promise.all([
        await dispatch(actionFetchedCreateStake(payload)),
        await dispatch(
          actionChangeFlowAmount({amount: payload?.Amount || amount}),
        ),
        await dispatch(actionFetch()),
      ]);
    }
  } catch (error) {
    await dispatch(actionFetchFailCreateStake());
    throw new Error(error);
  }
};

export const actionFetchingCreateUnStake = () => ({
  type: ACTION_FETCHING_CREATE_UNSTAKE,
});

export const actionFetchedCreateUnStake = payload => ({
  type: ACTION_FETCHED_CREATE_UNSTAKE,
  payload,
});

export const actionFetchFailCreateUnStake = () => ({
  type: ACTION_FETCH_FAIL_CREATE_UNSTAKE,
});

export const actionFetchCreateUnStake = ({amount}) => async (
  dispatch,
  getState,
) => {
  try {
    const state = getState();
    const {isFetching} = createUnStakeSelector(state);
    if (isFetching) {
      return;
    }
    await dispatch(actionFetchingCreateUnStake());
    const pStakeAccount = pStakeAccountSelector(state);
    const {account} = activeFlowSelector(state);
    const originalAmount = convert.toOriginalAmount(
      convert.toNumber(amount),
      CONSTANT_COMMONS.PRV.pDecimals,
    );
    const signEncode = await signPoolWithdraw(
      pStakeAccount?.PrivateKey,
      account?.PaymentAddress,
      originalAmount,
    );
    const data = {
      PStakeAddress: pStakeAccount?.PaymentAddress,
      PaymentAddress: account?.PaymentAddress,
      Amount: originalAmount,
      SignEncode: signEncode,
    };
    const payload = await apiUnStake(data);
    if (payload?.ID) {
      return await new Promise.all([
        await dispatch(actionFetchedCreateUnStake(payload)),
        await dispatch(
          actionChangeFlowAmount({amount: payload?.Amount || amount}),
        ),
        await dispatch(actionFetch()),
      ]);
    }
  } catch (error) {
    await dispatch(actionFetchFailCreateUnStake());
    throw new Error(error);
  }
};
