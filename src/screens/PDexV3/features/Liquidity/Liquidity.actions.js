import {
  contributeSelector,
  TYPES,
  formConfigsContribute,
  formConfigsCreatePool,
  removePoolSelector,
  formConfigsRemovePool,
  createPoolSelector,
} from '@screens/PDexV3/features/Liquidity';
import { batch } from 'react-redux';
import { getBalance } from '@src/redux/actions/token';
import { ExHandler } from '@services/exception';
import uniq from 'lodash/uniq';
import { mappingDataSelector } from '@screens/PDexV3/features/Liquidity/Liquidity.contributeSelector';
import {
  actionGetPDexV3Inst,
  calculateContributeValue,
  getPDexV3Instance,
  parseInputWithText,
} from '@screens/PDexV3';
import { change } from 'redux-form';
import { allTokensIDsSelector } from '@src/redux/selectors/token';
import { actionFetch as actionFetchPortfolio } from '@screens/PDexV3/features/Portfolio';
import BigNumber from 'bignumber.js';
import format from '@utils/format';
import convertUtil from '@utils/convert';
import { defaultAccountWalletSelector } from '@src/redux/selectors/account';
import { actionSetNFTTokenData } from '@src/redux/actions/account';
import { filterTokenList } from '@screens/PDexV3/features/Liquidity/Liquidity.utils';
import { listPoolsPureSelector } from '@screens/PDexV3/features/Pools';
import { debounce } from 'lodash';

/***
 *================================================================
 *==========================CONTRIBUTE============================
 *================================================================
 **/
const actionFetchingContribute = ({ isFetching }) => ({
  type: TYPES.ACTION_FETCHING_CONTRIBUTE_DATA,
  payload: { isFetching },
});

const actionSetContributeID = ({ poolId, nftId }) => ({
  type: TYPES.ACTION_SET_CONTRIBUTE_ID,
  payload: { poolId, nftId },
});

const actionSetContributePoolData = ({ data, inputToken, outputToken }) => ({
  type: TYPES.ACTION_SET_CONTRIBUTE_POOL_DATA,
  payload: { data, inputToken, outputToken },
});

const actionGetBalance =
  (tokenIDs = []) =>
  async (dispatch) => {
    try {
      tokenIDs = uniq(tokenIDs);
      tokenIDs.forEach((tokenID) => {
        dispatch(getBalance(tokenID));
      });
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };

const actionInitContribute = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const isFetching = contributeSelector.statusSelector(state);
    if (isFetching) return;
    dispatch(actionFetchingContribute({ isFetching: true }));
    const poolID = contributeSelector.poolIDSelector(state);
    const account = defaultAccountWalletSelector(state);
    const pDexV3Inst = await getPDexV3Instance({ account });
    const [poolDetails] = await Promise.all([
      (await pDexV3Inst.getListPoolsDetail([poolID])) || [],
      await dispatch(actionSetNFTTokenData()),
    ]);
    if (poolDetails.length > 0) {
      const contributePool = poolDetails[0];
      if (!contributePool) return;
      const { token1Id, token2Id } = contributePool;
      batch(() => {
        dispatch(
          actionSetContributePoolData({
            data: contributePool,
            inputToken: token1Id,
            outputToken: token2Id,
          }),
        );
        dispatch(actionGetBalance([token1Id, token2Id]));
      });
    }
  } catch (error) {
    new ExHandler(error).showErrorToast();
  } finally {
    dispatch(actionFetchingContribute({ isFetching: false }));
  }
};

const actionChangeInputContribute =
  (newInput) => async (dispatch, getState) => {
    try {
      const state = getState();
      const { inputToken, outputToken, token1PoolValue, token2PoolValue } =
        mappingDataSelector(state);
      const inputValue = parseInputWithText({
        text: newInput,
        token: inputToken,
      });
      const outputText = calculateContributeValue({
        inputValue,
        outputToken,
        inputToken,
        inputPool: token1PoolValue,
        outputPool: token2PoolValue,
      });
      batch(() => {
        dispatch(
          change(
            formConfigsContribute.formName,
            formConfigsContribute.inputToken,
            newInput,
          ),
        );
        dispatch(
          change(
            formConfigsContribute.formName,
            formConfigsContribute.outputToken,
            outputText,
          ),
        );
      });
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };

const actionChangeOutputContribute =
  (newOutput) => async (dispatch, getState) => {
    try {
      const state = getState();
      const { inputToken, outputToken, token1PoolValue, token2PoolValue } =
        mappingDataSelector(state);
      const outputValue = parseInputWithText({
        text: newOutput,
        token: outputToken,
      });
      const inputText = calculateContributeValue({
        inputValue: outputValue,
        outputToken: inputToken,
        inputToken: outputToken,
        inputPool: token2PoolValue,
        outputPool: token1PoolValue,
      });
      batch(() => {
        dispatch(
          change(
            formConfigsContribute.formName,
            formConfigsContribute.inputToken,
            inputText,
          ),
        );
        dispatch(
          change(
            formConfigsContribute.formName,
            formConfigsContribute.outputToken,
            newOutput,
          ),
        );
      });
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };

/***
 *================================================================
 *==========================Create Pool============================
 *================================================================
 **/
const actionSetCreatePoolToken = (payload) => ({
  type: TYPES.ACTION_SET_CREATE_POOL_TOKEN,
  payload,
});

const actionFeeCreatePool = () => ({
  type: TYPES.ACTION_FREE_CREATE_POOL_TOKEN,
});

const actionSetFetchingCreatePool = ({ isFetching }) => ({
  type: TYPES.ACTION_SET_FETCHING_CREATE_POOL,
  payload: { isFetching },
});

const actionSetTypingCreatePool = ({ isTyping }) => ({
  type: TYPES.ACTION_SET_TYPING_CREATE_POOL,
  payload: { isTyping },
});

const actionSetFocusCreatePool = ({ focusField }) => ({
  type: TYPES.ACTION_SET_FOCUS_CREATE_POOL,
  payload: { focusField },
});

const actionSetRateCreatePool = ({ rate, amp }) => ({
  type: TYPES.ACTION_SET_RATE_CREATE_POOL,
  payload: { rate, amp },
});

const debouncedGetCreatePoolRate = debounce(async (dispatch, _, payload) => {
  try {
    const { inputToken, inputAmount, outputToken, outputAmount } = payload;
    const pDexV3Inst = await dispatch(actionGetPDexV3Inst());
    const data = await pDexV3Inst.rpcTradeService.apiCheckRate({
      token1: inputToken,
      token2: outputToken,
      amount1: inputAmount,
      amount2: outputAmount,
    });
    if (!data) return;
    let { maxAmp, rate } = data;
    maxAmp = new BigNumber(maxAmp).multipliedBy(1e4).toNumber();
    dispatch(actionSetRateCreatePool({ rate, amp: maxAmp }));
  } catch (error) {
    new ExHandler(error).showErrorToast();
  } finally {
    dispatch(actionSetTypingCreatePool({ isTyping: false }));
  }
}, 1000);

const asyncActionDebounced = (payload, closure) => (dispatch, getState) =>
  closure(dispatch, getState, payload);

const actionSetCreatePoolText = (text) => async (dispatch, getState) => {
  try {
    const state = getState();
    const field = createPoolSelector.focusFieldSelector(state);
    dispatch(change(formConfigsCreatePool.formName, field, text));
  } catch (error) {
    new ExHandler(error).showErrorToast();
  }
};

const actionUpdateCreatePoolInputToken =
  (tokenId) => async (dispatch, getState) => {
    try {
      const state = getState();
      const isFetching = createPoolSelector.isFetchingSelector(state);
      if (isFetching) return;
      dispatch(actionSetFetchingCreatePool({ isFetching: true }));
      const tokenIds = allTokensIDsSelector(state);
      const { inputToken, outputToken } =
        createPoolSelector.tokenSelector(state);
      const pools = listPoolsPureSelector(state);
      const newInputToken = tokenId;
      let newOutputToken = outputToken.tokenId;
      if (newInputToken === outputToken.tokenId) {
        newOutputToken = inputToken.tokenId;
      }
      const outputTokens = filterTokenList({
        tokenId: newInputToken,
        pools,
        tokenIds,
        ignoreTokens: [newInputToken],
      });
      const isExist = outputTokens.some(
        (tokenId) => tokenId === newOutputToken,
      );
      if (!isExist) newOutputToken = outputTokens[0];
      await Promise.all([
        dispatch(
          actionSetCreatePoolToken({
            inputToken: newInputToken,
            outputToken: newOutputToken,
          }),
        ),
        dispatch(actionGetBalance([newInputToken, newOutputToken])),
      ]);
    } catch (error) {
      new ExHandler(error).showErrorToast();
    } finally {
      dispatch(actionSetFetchingCreatePool({ isFetching: false }));
    }
  };

const actionUpdateCreatePoolOutputToken =
  (tokenId) => async (dispatch, getState) => {
    try {
      const state = getState();
      const isFetching = createPoolSelector.isFetchingSelector(state);
      if (isFetching) return;
      dispatch(actionSetFetchingCreatePool({ isFetching: true }));
      const { inputToken, outputToken } =
        createPoolSelector.tokenSelector(state);
      const newOutputToken = tokenId;
      let newInputToken = inputToken.tokenId;
      if (newInputToken === outputToken.tokenId) {
        newInputToken = outputToken.tokenId;
      }
      batch(() => {
        dispatch(
          actionSetCreatePoolToken({
            inputToken: newInputToken,
            outputToken: newOutputToken,
          }),
        );
        dispatch(actionGetBalance([newInputToken, newOutputToken]));
      });
    } catch (error) {
      new ExHandler(error).showErrorToast();
    } finally {
      dispatch(actionSetFetchingCreatePool({ isFetching: false }));
    }
  };

const actionInitCreatePool = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const isFetching = createPoolSelector.isFetchingSelector(state);
    if (isFetching) return;
    dispatch(actionSetFetchingCreatePool({ isFetching: true }));
    const tokenIDs = allTokensIDsSelector(state);
    const listPools = listPoolsPureSelector(state);
    const { inputToken, outputToken } = createPoolSelector.tokenSelector(state);
    let newInputToken, newOutputToken;
    if (!inputToken && !outputToken) {
      newInputToken = tokenIDs[0];
      const outputTokens = filterTokenList({
        tokenId: newInputToken,
        pools: listPools,
        tokenIds: tokenIDs,
        ignoreTokens: [newInputToken],
      });
      newOutputToken = outputTokens[0];
    } else {
      newInputToken = inputToken.tokenId;
      newOutputToken = outputToken.tokenId;
    }
    await Promise.all([
      dispatch(
        actionSetCreatePoolToken({
          inputToken: newInputToken,
          outputToken: newOutputToken,
        }),
      ),
      dispatch(actionGetBalance([newInputToken, newOutputToken])),
      dispatch(actionSetNFTTokenData()),
    ]);
  } catch (error) {
    new ExHandler(error).showErrorToast();
  } finally {
    dispatch(actionSetFetchingCreatePool({ isFetching: false }));
  }
};

/***
 *================================================================
 *==========================Remove Pool============================
 *================================================================
 **/
const actionFetchingRemovePool = ({ isFetching }) => ({
  type: TYPES.ACTION_SET_REMOVE_FETCHING,
  payload: { isFetching },
});

const actionSetRemoveShareID = (payload) => ({
  type: TYPES.ACTION_SET_REMOVE_SHARE_ID,
  payload,
});

const actionSetRemovePoolToken = ({ inputToken, outputToken }) => ({
  type: TYPES.ACTION_SET_REMOVE_POOL_TOKEN,
  payload: { inputToken, outputToken },
});

const actionInitRemovePool = () => async (dispatch, getState) => {
  try {
    const state = getState();
    dispatch(actionFetchingRemovePool({ isFetching: true }));
    const { inputToken, outputToken } = removePoolSelector.tokenSelector(state);
    if (!inputToken || !outputToken) return;
    const tasks = [
      dispatch(actionFetchPortfolio()),
      dispatch(actionGetBalance([inputToken.tokenId, outputToken.tokenId])),
      dispatch(actionSetNFTTokenData()),
    ];
    await Promise.all(tasks);
  } catch (error) {
    new ExHandler(error).showErrorToast();
  } finally {
    dispatch(actionFetchingRemovePool({ isFetching: false }));
  }
};

const actionChangeInputRemovePool = (newText) => async (dispatch, getState) => {
  try {
    const state = getState();
    const { inputToken, outputToken } = removePoolSelector.tokenSelector(state);
    const maxShareData = removePoolSelector.maxShareAmountSelector(state);
    const { maxInputShare, maxOutputShare } = maxShareData;
    const inputValue = parseInputWithText({ text: newText, token: inputToken });
    const outputValue = new BigNumber(inputValue)
      .multipliedBy(maxOutputShare)
      .dividedBy(maxInputShare)
      .toNumber();
    const outputHumanValue = convertUtil.toHumanAmount(
      outputValue,
      outputToken.pDecimals,
    );
    const outputText = format.toFixed(outputHumanValue, outputToken.pDecimals);
    batch(() => {
      dispatch(
        change(
          formConfigsRemovePool.formName,
          formConfigsRemovePool.inputToken,
          newText,
        ),
      );
      dispatch(
        change(
          formConfigsRemovePool.formName,
          formConfigsRemovePool.outputToken,
          outputText,
        ),
      );
    });
  } catch (error) {
    new ExHandler(error).showErrorToast();
  }
};

const actionChangeOutputRemovePool =
  (newText) => async (dispatch, getState) => {
    try {
      const state = getState();
      const { inputToken, outputToken } =
        removePoolSelector.tokenSelector(state);
      const maxShareData = removePoolSelector.maxShareAmountSelector(state);
      const { maxInputShare, maxOutputShare } = maxShareData;
      const outputValue = parseInputWithText({
        text: newText,
        token: outputToken,
      });
      const inputValue = new BigNumber(outputValue)
        .multipliedBy(maxInputShare)
        .dividedBy(maxOutputShare)
        .toNumber();
      const inputHumanValue = convertUtil.toHumanAmount(
        inputValue,
        inputToken.pDecimals,
      );
      const inputText = format.toFixed(inputHumanValue, inputToken.pDecimals);
      batch(() => {
        dispatch(
          change(
            formConfigsRemovePool.formName,
            formConfigsRemovePool.inputToken,
            inputText,
          ),
        );
        dispatch(
          change(
            formConfigsRemovePool.formName,
            formConfigsRemovePool.outputToken,
            newText,
          ),
        );
      });
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };

const actionMaxRemovePool = () => async (dispatch, getState) => {
  try {
    const state = getState();
    const maxShareData = removePoolSelector.maxShareAmountSelector(state);
    const { maxInputShareStr, maxOutputShareStr } = maxShareData;

    batch(() => {
      dispatch(
        change(
          formConfigsRemovePool.formName,
          formConfigsRemovePool.inputToken,
          maxInputShareStr,
        ),
      );
      dispatch(
        change(
          formConfigsRemovePool.formName,
          formConfigsRemovePool.outputToken,
          maxOutputShareStr,
        ),
      );
    });
  } catch (error) {
    new ExHandler(error).showErrorToast();
  }
};

const actionChangePercentRemovePool =
  (percent) => async (dispatch, getState) => {
    try {
      const state = getState();
      const maxShareData = removePoolSelector.maxShareAmountSelector(state);
      const { inputToken, outputToken } =
        removePoolSelector.tokenSelector(state);
      const { maxInputHuman, maxOutputHuman } = maxShareData;

      const percentNum = 100;
      const inputHuman = new BigNumber(maxInputHuman)
        .multipliedBy(percent)
        .dividedBy(percent)
        .toNumber();
      const inputStr = format.toFixed(inputHuman, inputToken.pDecimals);

      const outputHuman = new BigNumber(maxOutputHuman)
        .multipliedBy(percent)
        .dividedBy(percent)
        .toNumber();
      const outputStr = format.toFixed(outputHuman, outputToken.pDecimals);
      batch(() => {
        dispatch(
          change(
            formConfigsRemovePool.formName,
            formConfigsRemovePool.inputToken,
            inputStr,
          ),
        );
        dispatch(
          change(
            formConfigsRemovePool.formName,
            formConfigsRemovePool.outputToken,
            outputStr,
          ),
        );
      });
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };

export const actionFree = () => ({
  type: TYPES.ACTION_FREE,
});

export default {
  actionGetBalance,
  actionSetContributeID,
  actionInitContribute,
  actionChangeInputContribute,
  actionChangeOutputContribute,

  actionSetCreatePoolToken,
  actionUpdateCreatePoolInputToken,
  actionUpdateCreatePoolOutputToken,
  actionInitCreatePool,
  actionSetCreatePoolText,
  actionFeeCreatePool,
  actionSetFocusCreatePool,
  asyncActionDebounced,
  debouncedGetCreatePoolRate,
  actionSetTypingCreatePool,

  actionSetRemoveShareID,
  actionSetRemovePoolToken,
  actionInitRemovePool,
  actionChangeInputRemovePool,
  actionChangeOutputRemovePool,
  actionMaxRemovePool,
  actionChangePercentRemovePool,

  actionFree,
};
