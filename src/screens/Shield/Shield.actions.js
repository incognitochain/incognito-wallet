import { selectedPrivacySelector } from '@src/redux/selectors';
import { getMinMaxDepositAmount } from '@src/services/api/misc';
import {
  genETHDepositAddress,
  genERC20DepositAddress,
  genCentralizedDepositAddress,
  genBSCDepositAddress,
} from '@src/services/api/deposit';
import { ANALYTICS, CONSTANT_COMMONS } from '@src/constants';
import config from '@src/constants/config';
import { signPublicKeyEncodeSelector } from '@src/redux/selectors/account';
import formatUtil from '@utils/format';
import { requestUpdateMetrics } from '@src/redux/actions/app';
import {
  ACTION_FETCHING,
  ACTION_FETCHED,
  ACTION_FETCH_FAIL,
  ACTION_TOGGLE_GUIDE,
  ACTION_RESET,
  ACTION_BSC_FEE_FETCHING,
} from './Shield.constant';
import { shieldSelector } from './Shield.selector';
import { PRV_ID } from '../DexV2/constants';

export const actionReset = () => ({
  type: ACTION_RESET,
});

export const actionFetching = () => ({
  type: ACTION_FETCHING,
});

export const actionFetched = (payload) => ({
  type: ACTION_FETCHED,
  payload,
});

export const actionBSCFetch = (bscPayload) => ({
  type: ACTION_BSC_FEE_FETCHING,
  bscPayload,
});

export const actionFetchFail = (isPortalCompatible = true) => ({
  type: ACTION_FETCH_FAIL,
  isPortalCompatible: isPortalCompatible,
});

export const actionGetMinMaxShield = async ({ tokenId }) => {
  try {
    return await getMinMaxDepositAmount(tokenId);
  } catch (e) {
    throw 'Can not get min/max amount to deposit';
  }
};

export const actionGetAddressToShield = async ({
  selectedPrivacy,
  account,
  signPublicKeyEncode,
}) => {
  try {
    let generateResult = {};
    if (!selectedPrivacy?.isPToken) {
      return null;
    }
    if (
      selectedPrivacy?.currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.ETH
    ) {
      generateResult = await genETHDepositAddress({
        paymentAddress: account.PaymentAddress,
        walletAddress: account.PaymentAddress,
        tokenId: selectedPrivacy?.tokenId,
        currencyType: selectedPrivacy?.currencyType,
        signPublicKeyEncode,
      });
    } else if (selectedPrivacy?.isErc20Token || selectedPrivacy?.tokenId === PRV_ID) {
      let currencyType_ = selectedPrivacy?.currencyType;
      let tokenContractID_ = selectedPrivacy?.contractId;
      if (selectedPrivacy?.tokenId === PRV_ID) {
        console.log({selectedPrivacy});
        if (selectedPrivacy?.listChildToken) {
          const tokenChild = selectedPrivacy?.listChildToken.find(x => x.currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.ERC20);
          currencyType_ = tokenChild?.currencyType;
          tokenContractID_ = tokenChild?.contractId;
        }
      }

      generateResult = await genERC20DepositAddress({
        paymentAddress: account.PaymentAddress,
        walletAddress: account.PaymentAddress,
        tokenId: selectedPrivacy?.tokenId,
        tokenContractID: tokenContractID_,
        currencyType: currencyType_,
        signPublicKeyEncode,
      });
    } else if (
      selectedPrivacy?.isBep20Token ||
      selectedPrivacy?.currencyType ===
        CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.BSC_BNB
    ) {
      generateResult = await genBSCDepositAddress({
        paymentAddress: account.PaymentAddress,
        walletAddress: account.PaymentAddress,
        tokenId: selectedPrivacy?.tokenId,
        tokenContractID: selectedPrivacy?.contractId,
        currencyType: selectedPrivacy?.currencyType,
        signPublicKeyEncode,
      });
    } else {
      generateResult = await genCentralizedDepositAddress({
        paymentAddress: account.PaymentAddress,
        walletAddress: account.PaymentAddress,
        tokenId: selectedPrivacy?.tokenId,
        currencyType: selectedPrivacy?.currencyType,
        signPublicKeyEncode,
      });
    }
    const {
      address,
      expiredAt,
      decentralized,
      estimateFee,
      tokenFee,
    } = generateResult;
    if (!address) {
      throw 'Can not gen new deposit address';
    }
    return { address, expiredAt, decentralized, estimateFee, tokenFee };
  } catch (error) {
    throw error;
  }
};

export const actionGetPRVBep20FeeToShield = (account, signPublicKeyEncode, selectedPrivacy) => async (
  dispatch,
  getState,
) => {
  let generateResult = await genBSCDepositAddress({
    paymentAddress: account.PaymentAddress,
    walletAddress: account.PaymentAddress,
    tokenId: selectedPrivacy?.tokenId,
    tokenContractID: selectedPrivacy?.contractId,
    currencyType: selectedPrivacy?.currencyType,
    signPublicKeyEncode,
  });
  let {
    tokenFee,
    estimateFee,
  } = generateResult;
  await dispatch(
    actionBSCFetch({
      tokenFee,
      estimateFee,
    }),
  );
};

export const actionFetch = ({ tokenId, selectedPrivacy, account }) => async (
  dispatch,
  getState,
) => {
  try {
    const state = getState();
    const { isFetching } = shieldSelector(state);
    const signPublicKeyEncode = signPublicKeyEncodeSelector(state);
    if (!selectedPrivacy || isFetching) {
      return;
    }
    dispatch(actionFetching());
    const [dataMinMax, addressShield] = await Promise.all([
      actionGetMinMaxShield({ tokenId }),
      actionGetAddressToShield({
        selectedPrivacy,
        account,
        signPublicKeyEncode,
      }),
    ]);

    let {
      address,
      expiredAt,
      decentralized,
      tokenFee,
      estimateFee,
    } = addressShield;

    const [min, max] = dataMinMax;
    if (expiredAt) {
      expiredAt = formatUtil.formatDateTime(expiredAt);
    }

    await dispatch(
      actionBSCFetch({
        tokenFee : 0,
        estimateFee : 0,
      }),
    );

    await dispatch(
      actionFetched({
        min,
        max,
        address,
        expiredAt,
        decentralized,
        tokenFee,
        estimateFee,
        isPortal: false,
      }),
    );
  } catch (error) {
    await dispatch(actionFetchFail());
    throw error;
  }
};

export const actionGeneratePortalShieldAddress = async ({ accountWallet, tokenID, incAddress }) => {
  try {
    const chainName = config.isMainnet ? 'mainnet' : 'testnet';
    return accountWallet.handleGenerateShieldingAddress({ tokenID, incAddress, chainName });
  } catch (e) {
    throw new Error(`Can not generate portal shield address ${e}`);
  }
};

export const actionGetPortalMinShieldAmt = async ({ accountWallet, tokenID }) => {
  try {
    return accountWallet.handleGetPortalMinShieldAmount({ tokenID });
  } catch (e) {
    throw new Error('Can not get portal min shielding amount');
  }
};

export const actionAddPortalShieldAddress = async ({ accountWallet, incAddress, shieldingAddress }) => {
  try {
    let isExisted = await accountWallet.handleCheckPortalShieldingAddresssExisted({ incAddress, shieldingAddress });
    if ( isExisted ){
      return;
    }
    let isAdded = await accountWallet.handleAddPortalShieldingAddresss({ incAddress, shieldingAddress });
    if ( !isAdded ){
      throw new Error('Can not add portal shielding address api');
    }
  } catch (e) {
    throw new Error('Can not add portal shielding address');
  }
};

export const actionPortalFetch = ({ tokenID, selectedPrivacy, account, accountWallet }) => async (
  dispatch,
  getState,
) => {
  try {
    const state = getState();
    const { isFetching } = shieldSelector(state);
    if (!selectedPrivacy || isFetching) {
      return;
    }
    dispatch(actionFetching());

    const [minShieldAmt, shieldingAddress] = await Promise.all([
      actionGetPortalMinShieldAmt({ accountWallet, tokenID }),
      actionGeneratePortalShieldAddress({ accountWallet, tokenID, incAddress: account.paymentAddress })
    ]);

    await actionAddPortalShieldAddress({ accountWallet, incAddress: account.paymentAddress, shieldingAddress });

    await dispatch(
      actionFetched({
        min: formatUtil.amountFull(minShieldAmt, selectedPrivacy.pDecimals),
        max: null,
        address: shieldingAddress,
        expiredAt: '',
        decentralized: null,
        tokenFee: 0,
        estimateFee: 0,
        isPortal: true,
      }),
    );
    dispatch(requestUpdateMetrics(ANALYTICS.ANALYTIC_DATA_TYPE.SHIELD));
  } catch (error) {
    let isCompatible = true;
    if (error.message?.includes('Shielding address is not compatible'))  {
      isCompatible = false;
    }
    await dispatch(actionFetchFail(isCompatible));
    throw error;
  }
};

export const actionToggleGuide = () => ({
  type: ACTION_TOGGLE_GUIDE,
});
