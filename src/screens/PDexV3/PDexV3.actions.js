/* eslint-disable import/no-cycle */
import { defaultAccountWalletSelector } from '@src/redux/selectors/account';
import Server from '@src/services/wallet/Server';
import storage from '@src/services/storage';
import { PDexV3 } from 'incognito-chain-web-js/build/wallet';
import { getToken } from '@src/services/auth';

export const getPDexV3Instance = async ({ account = {} } = {}) => {
  try {
    const server = await Server.getDefault();
    let pDexV3Inst = new PDexV3();
    const authToken = await getToken();
    if (account) {
      pDexV3Inst.setAccount(account);
    }
    pDexV3Inst.setAuthToken(authToken);
    pDexV3Inst.setRPCTradeService(server.tradeServices);
    pDexV3Inst.setRPCCoinServices(server.coinServices);
    pDexV3Inst.setStorageServices(storage);
    pDexV3Inst.setRPCTxServices(server.pubsubServices);
    pDexV3Inst.setRPCApiServices(server.apiServices);
    return pDexV3Inst;
  } catch (error) {
    console.log('getPDexV3Instance-error', error);
  }
};

export const actionGetPDexV3Inst = () => async (dispatch, getState) => {
  const state = getState();
  const account = defaultAccountWalletSelector(state);
  const pDexV3 = await getPDexV3Instance({ account });
  return pDexV3;
};
