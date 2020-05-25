import accountService from '@src/services/wallet/accountService';
import { accountSeleclor } from '@src/redux/selectors';
import internalTokenModel from '@models/token';
import PToken from '@src/models/pToken';
import { CustomError, ErrorCode } from '@src/services/exception';
import { getPassphrase } from '@src/services/wallet/passwordService';
import { setWallet, reloadAccountList } from './wallet';

export const actionAddFollowToken = tokenId => async (dispatch, getState) => {
  try {
    const state = getState();
    const account = accountSeleclor.defaultAccount(state);
    const wallet = state.wallet;
    const { pTokens, internalTokens } = state.token;
    const foundPToken: PToken = pTokens?.find(
      (pToken: PToken) => pToken.tokenId === tokenId,
    );
    const foundInternalToken =
      !foundPToken && internalTokens?.find(token => token.id === tokenId);
    const token =
      (foundInternalToken && internalTokenModel.toJson(foundInternalToken)) ||
      foundPToken?.convertToToken();
    if (!token) throw Error('Can not follow empty coin');
    await accountService.addFollowingTokens([token], account, wallet);
    await dispatch(setWallet(wallet));
  } catch (error) {
    throw Error(error);
  }
};

export const actionRemoveFollowToken = tokenId => async (
  dispatch,
  getState,
) => {
  try {
    const state = getState();
    const account = accountSeleclor.defaultAccount(state);
    const wallet = state.wallet;
    const updatedWallet = await accountService.removeFollowingToken(
      tokenId,
      account,
      wallet,
    );
    await dispatch(setWallet(updatedWallet));
  } catch (error) {
    throw Error(error);
  }
};

export const actionImportAccount = ({
  privateKey,
  oldPrivateKey,
  accountName,
}) => async (dispatch, getState) => {
  const state = getState();
  const wallet = state?.wallet;
  const passphrase = await getPassphrase();
  try {
    const isImported = await accountService.importAccount(
      privateKey,
      accountName,
      passphrase,
      wallet,
    );
    if (!isImported) {
      throw new CustomError(ErrorCode.importAccount_failed);
    }
  } catch (error) {
    await accountService.importAccount(
      oldPrivateKey,
      accountName,
      passphrase,
      wallet,
    );
    throw Error(error);
  } finally {
    await dispatch(reloadAccountList());
  }
};
