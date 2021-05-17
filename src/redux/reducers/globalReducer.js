import { CONSTANT_APP } from '@src/constants';
import { accountSelector } from '@src/redux/selectors';

const reducer = (state, action) => {
  if (/ACCOUNT\//.test(action.type) || /WALLET\//.test(action.type)) {
    const account = accountSelector.defaultAccount(state);
    const isWalletLoaded = !!state?.wallet?.Name;
    const isAccountLoaded = account?.value !== null;
    const appState = state?.app;
    let status = appState?.status;

    if (!isWalletLoaded) status = CONSTANT_APP.STATUS.WALLET_IS_NOT_LOADED;
    if (!isAccountLoaded) status = CONSTANT_APP.STATUS.ACCOUNT_IS_NOT_LOADED;
    if (isWalletLoaded && isAccountLoaded) status = CONSTANT_APP.STATUS.READY;

    return {
      ...state,
      app: {
        ...appState,
        status,
        isReady: status === CONSTANT_APP.STATUS.READY,
      }
    };
  }

  return state;
};

export default reducer;