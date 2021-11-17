import {createSelector} from 'reselect';
import {selectedPrivacySelector as selectedPrivacy, sharedSelector} from '@src/redux/selectors';
import formatUtil from '@utils/format';
import {MESSAGES} from '@screens/Dex/constants';
import {formValueSelector} from 'redux-form';
import convert from '@utils/convert';
import {
  formConfigsInvest,
  formConfigsWithdrawInvest,
  formConfigsWithdrawReward, STAKING_MESSAGES
} from '@screens/PDexV3/features/Staking/Staking.constant';
import BigNumber from 'bignumber.js';
import {PRVIDSTR, ACCOUNT_CONSTANT} from 'incognito-chain-web-js/build/wallet';
import {getHistoriesKey} from '@screens/PDexV3/features/Staking/Staking.utils';
import flatten from 'lodash/flatten';
import {PRV} from '@src/constants/common';
import uniq from 'lodash/uniq';
import {CONSTANT_COMMONS} from '@src/constants';
import {getValidRealAmountNFTSelector, isFetchingNFTSelector, nftTokenDataSelector} from '@src/redux/selectors/account';
import orderBy from 'lodash/orderBy';
import {COLORS} from '@src/styles';
import maxBy from 'lodash/maxBy';


export const stakingSelector = createSelector(
  (state) => state.pDexV3,
  ({ staking }) => {
    return staking;
  },
);

export const isFetchingCoinsSelector = createSelector(
  stakingSelector,
  ({ isFetching }) => isFetching);

const mapperStakingCoins = createSelector(
  stakingSelector,
  ({ coins }) => {
    return coins.reduce((prev, curr) => {
      const index = prev.findIndex(item => item.tokenId === curr.tokenId);
      if (index !== -1) {
        // exist
        prev[index]?.coins.push(curr);
      } else {
        prev.push({
          tokenId: curr.tokenId,
          coins: [curr]
        });
      }
      return prev;
    }, []);
  }
);

export const stakingCoinsSelector = createSelector(
  mapperStakingCoins,
  selectedPrivacy.getPrivacyDataByTokenID,
  sharedSelector.isGettingBalance,
  getValidRealAmountNFTSelector,
  isFetchingNFTSelector,
  (stakingCoins, getPrivacyDataByTokenID, isGettingBalance, validNFT, isFetchingNFT) => {
    return (stakingCoins || []).map(({ coins, tokenId }) => {
      const hasValidNFT = coins.some(({ nftId }) => validNFT(nftId));
      const inValidNFTs = coins.filter(({ nftId }) => !validNFT(nftId));
      const token = getPrivacyDataByTokenID(tokenId);
      const userBalance = token.amount;
      const userBalanceStr = formatUtil.amountFull(userBalance, token.pDecimals);
      const userBalanceSymbolStr = `${userBalanceStr} ${token.symbol}`;
      const user = { userBalance, userBalanceStr, userBalanceSymbolStr };
      /**---------------------------------------------------------*/
      const stakingAmount = coins.reduce((prev, curr) => new BigNumber(prev).plus(curr.amount).toNumber(), 0);
      const stakingAmountStr = formatUtil.amountVer2(stakingAmount, token.pDecimals);
      const stakingAmountSymbolStr = `${stakingAmountStr} ${token.symbol}`;
      const staking = { stakingAmount, stakingAmountStr, stakingAmountSymbolStr };
      /**---------------------------------------------------------*/
      const rewardsCoins = coins.map((coin) => ({
        coins: coin.reward,
        nftId: coin.nftId,
      }));
      const rewardTokenIds = uniq(flatten(rewardsCoins.map(({ coins: reward }) => Object.keys(reward))));
      const rewardsMerged = rewardTokenIds.reduce((prev, curr) => {
        const tokenId = curr;
        const token = getPrivacyDataByTokenID(tokenId);
        const reward = rewardsCoins.reduce((_prev, _curr) => (_curr.coins[tokenId] || 0) + _prev, 0);
        const rewardStr = formatUtil.amountFull(reward, token.pDecimals);
        const rewardUSD = convert.toHumanAmount(new BigNumber(reward).multipliedBy(token.priceUsd).toNumber(), token.pDecimals);
        prev.push({ tokenId, reward, rewardStr, token, rewardUSD });
        return prev;
      }, []);
      const totalRewardUSD = rewardsMerged.reduce((prev, curr) => new BigNumber(prev).plus(curr.rewardUSD).toNumber(), 0);
      const totalRewardAmount = Math.ceil(new BigNumber(totalRewardUSD).multipliedBy(Math.pow(10, token.pDecimals || 9)).toNumber());
      const totalRewardUSDStr = `${CONSTANT_COMMONS.USD_SPECIAL_SYMBOL}${formatUtil.amountVer2(totalRewardAmount, token.pDecimals)}`;
      const reward = { rewardsCoins, rewardTokenIds, rewardsMerged, totalRewardUSD, totalRewardAmount, totalRewardUSDStr };
      /**---------------------------------------------------------*/
      const withdrawableCoins = orderBy(coins.filter(coin => (!!validNFT(coin.nftId)) && coin.amount), 'amount', 'asc');
      const maxWithdrawAmount = withdrawableCoins.reduce((prev, curr) => prev.plus(curr.amount || 0), new BigNumber(0)).toNumber();
      const maxWithdrawHumanAmount = convert.toHumanAmount(maxWithdrawAmount, token.pDecimals);
      const maxWithdrawAmountStr = formatUtil.toFixed(maxWithdrawHumanAmount, token.pDecimals);
      const maxWithdrawAmountSymbolStr = `${maxWithdrawAmountStr} ${token.symbol}`;
      const withdrawInvest = {
        withdrawableCoins,
        maxWithdrawAmount,
        maxWithdrawHumanAmount,
        maxWithdrawAmountStr,
        maxWithdrawAmountSymbolStr
      };
      /**---------------------------WITHDRAWABLE REWARD------------------------------*/
      const withdrawRewardCoins = rewardsCoins.filter((_reward) =>
        (!!validNFT(_reward.nftId)) && Object.values(_reward.coins).some(reward => reward));
      const withdrawRewardNFT = withdrawRewardCoins.map(({ nftId, coins }) => ({ nftId, receiveTokenIds: Object.keys(coins)}));
      const withdrawReward = {
        withdrawRewardCoins,
        withdrawRewardNFT,
      };
      return {
        coins,
        tokenId,
        token,
        user,
        hasValidNFT,
        inValidNFTs,
        isLoadingBalance: isGettingBalance.includes(tokenId),
        disableAction: !hasValidNFT || isFetchingNFT,
        staking,
        reward,
        withdrawInvest,
        withdrawReward,
        symbol: token.symbol
      };
    });
  }
);

const stakingRewardSelector = createSelector(
  stakingCoinsSelector,
  selectedPrivacy.getPrivacyDataByTokenID,
  (coins, getPrivacyDataByTokenID) => {
    const prvToken = getPrivacyDataByTokenID(PRV.id);
    const rewardUSD = coins.reduce((prev, curr) => new BigNumber(prev).plus(curr.reward.totalRewardAmount), new BigNumber(0)).toNumber();
    const rewardUSDStr = `${formatUtil.amountVer2(rewardUSD, prvToken.pDecimals)} $ `;
    const rewardPRV = Math.floor(new BigNumber(rewardUSD).dividedBy(prvToken.priceUsd).toNumber());
    const rewardPRVStr = `${formatUtil.amountVer2(rewardPRV, prvToken.pDecimals)} ${prvToken.symbol}`;
    return { rewardUSDStr, rewardPRVStr };
  }
);

const isExistStakingSelector = createSelector(
  stakingCoinsSelector,
  (stakingCoins) => stakingCoins.some(({ coins }) => coins.some(item => item.amount)),
);

export const stakingCoinByTokenIDSelector = createSelector(
  stakingCoinsSelector,
  (coins) => (tokenID) => coins.find(coin => coin.tokenId === tokenID)
);

export const stakingFeeSelector = createSelector(
  stakingSelector,
  selectedPrivacy.getPrivacyDataByTokenID,
  (staking, getPrivacyDataByTokenID) => {
    const { fee, feeToken } = staking;
    const token = getPrivacyDataByTokenID(feeToken);
    const feeAmountStr = formatUtil.amountFull(fee, token.pDecimals);
    const feeAmountSymbolStr = `${feeAmountStr} ${token.symbol}`;
    const useFeeBalance = token.amount;
    const useFeeBalanceStr = formatUtil.amountFull(useFeeBalance, token.pDecimals);
    const useFeeBalanceSymbolStr = `${useFeeBalanceStr} ${token.symbol}`;
    return {
      feeAmount: fee,
      feeAmountStr,
      feeAmountSymbolStr,
      feeToken: token,
      useFeeBalance,
      useFeeBalanceStr,
      useFeeBalanceSymbolStr
    };
  },
);

/**
 * ================================================================
 * =======================STAKING POOLS==========================
 * ================================================================
 **/
export const isFetchingPoolSelector = createSelector(
  stakingSelector,
  (staking) => {
    return staking.isFetchingPool;
  },
);

export const stakingPoolSelector = createSelector(
  stakingSelector,
  selectedPrivacy.getPrivacyDataByTokenID,
  sharedSelector.isGettingBalance,
  (staking, getPrivacyDataByTokenID, isGettingBalance) => {
    const pools = staking.pools || [];
    return pools.map((item) => {
      const { tokenId, amount: poolAmount, id, apy } = item;
      const token = getPrivacyDataByTokenID(tokenId);
      const userBalance = token.amount;
      const userBalanceStr = formatUtil.amountFull(token.amount, token.pDecimals);
      const userBalanceSymbolStr = `${userBalanceStr} ${token.symbol}`;
      const userBalanceDisplay = formatUtil.amountVer2(token.amount, token.pDecimal);
      const poolAmountStr = formatUtil.amountFull(poolAmount, token.pDecimals);
      const isLoadingBalance = isGettingBalance.includes(tokenId);
      const disabled = isLoadingBalance || userBalance === 0;
      return {
        id,
        tokenId,
        poolAmount,
        poolAmountStr,
        isLoadingBalance,
        userBalance,
        userBalanceStr,
        userBalanceSymbolStr,
        token,
        disabled,
        apy,
        apyStr: `${apy || 0}%`,
        userBalanceDisplay,
        symbol: token.symbol
      };
    });
  },
);

export const stakingPoolByTokenId = createSelector(
  stakingPoolSelector,
  (stakingPools) => (tokenId) => stakingPools.find(({ tokenId: _tokenId }) => _tokenId === tokenId),
);


/**
 * ================================================================
 * =======================STAKING INVEST==========================
 * ================================================================
 **/
export const stakingInvestSelector = createSelector(
  stakingSelector,
  (staking) => {
    return staking.invest;
  },
);

export const investPoolSelector = createSelector(
  stakingInvestSelector,
  stakingPoolByTokenId,
  ({ tokenID }, getStakingPool) => getStakingPool(tokenID),
);

export const investStakingCoinSelector = createSelector(
  stakingInvestSelector,
  stakingCoinByTokenIDSelector,
  nftTokenDataSelector,
  ({ tokenID }, stakingCoinByTokenID, { nftToken }) => {
    const stakingCoin = stakingCoinByTokenID(tokenID);
    if (!stakingCoin) return { nftStaking: nftToken };
    const { coins } = stakingCoin;
    let nftId = (maxBy(coins || [], 'amount') || {}).nftId;
    if (!nftId) nftId = nftToken;
    return {
      ...stakingCoin,
      nftStaking: nftId
    };
  },
);

const investInputValue = createSelector(
  (state) => state,
  investPoolSelector,
  (state, pool) => {
    if (!pool) return 0;
    const selector = formValueSelector(formConfigsInvest.formName);
    const inputText = selector(state, formConfigsInvest.input);
    const inputNumber = convert.toNumber(inputText, true) || 0;
    return convert.toOriginalAmount(inputNumber, pool.token.pDecimals);
  }
);

export const investInputAmount = createSelector(
  investInputValue,
  investPoolSelector,
  stakingFeeSelector,
  (inputValue, pool, fee) => {
    if (!pool) return {
      inputValue: 0,
      maxDepositValue: 0,
    };
    const { tokenId, token, userBalance } = pool;
    const { feeAmount, feeToken } = fee;
    const inputText = formatUtil.amountFull(inputValue, token.pDecimals);
    let depositText = inputText;
    let maxDepositValue = userBalance;
    if (feeToken.tokenId === tokenId && tokenId === PRVIDSTR && userBalance > feeAmount) {
      const depositValue = new BigNumber(inputValue).plus(feeAmount).toNumber();
      maxDepositValue = new BigNumber(userBalance).minus(feeAmount).toNumber();
      depositText = formatUtil.amountFull(depositValue, token.pDecimals);
    }
    const depositSymbolStr = `${depositText} ${token.symbol}`;
    const maxDepositHumanAmount = convert.toHumanAmount(maxDepositValue, token.pDecimals);
    const maxDepositText = formatUtil.toFixed(maxDepositHumanAmount, token.pDecimals);
    const inputSymbolStr = `${inputText} ${token.symbol}`;
    return {
      tokenId: token.tokenId,
      token,
      inputText,
      inputSymbolStr,
      inputValue,
      depositText,
      depositSymbolStr,
      maxDepositValue,
      maxDepositText,
    };
  }
);

export const investInputValidate = createSelector(
  stakingFeeSelector,
  investInputAmount,
  investPoolSelector,
  (fee, { inputValue, maxDepositValue }) => () => {
    try {
      const { feeAmount, feeToken } = fee;
      const { amount: userBalanceForFee } = feeToken;
      if (new BigNumber(feeAmount).gt(userBalanceForFee)) {
        return MESSAGES.NOT_ENOUGH_PRV_NETWORK_FEE;
      }
      if (new BigNumber(inputValue).gt(maxDepositValue)) {
        return MESSAGES.BALANCE_INSUFFICIENT;
      }
    } catch (error) {
      return error.message;
    }
  },
);

export const investButton = createSelector(
  investInputValue,
  investInputValidate,
  investPoolSelector,
  investStakingCoinSelector,
  nftTokenDataSelector,
  (inputValue, validate, { disabled: loadingBalance }, { nftStaking }, { initNFTToken }) => {
    const disabled = (inputValue <= 0 || !!validate() || loadingBalance) || !nftStaking;
    return {
      disabled,
      title: nftStaking ? STAKING_MESSAGES.staking : (initNFTToken ? STAKING_MESSAGES.waitNFT : STAKING_MESSAGES.staking),
    };
  }
);


/**
 * ================================================================
 * =======================WITHDRAW INVEST==========================
 * ================================================================
 **/
export const stakingWithdrawInvestSelector = createSelector(
  stakingSelector,
  (staking) => {
    return staking.withdrawInvest;
  },
);

export const withdrawInvestCoinSelector = createSelector(
  stakingWithdrawInvestSelector,
  stakingCoinByTokenIDSelector,
  ({ tokenID }, getStakingCoinByTokenID) => getStakingCoinByTokenID(tokenID),
);

const withdrawInvestInputValue = createSelector(
  (state) => state,
  withdrawInvestCoinSelector,
  (state, coin) => {
    const selector = formValueSelector(formConfigsWithdrawInvest.formName);
    const inputText = selector(state, formConfigsWithdrawInvest.input);
    const inputNumber = convert.toNumber(inputText, true) || 0;
    return convert.toOriginalAmount(inputNumber, coin.token.pDecimals);
  }
);

export const withdrawInvestInputSelector = createSelector(
  withdrawInvestCoinSelector,
  (coin) => coin.withdrawInvest
);

export const withdrawInvestValidate = createSelector(
  withdrawInvestInputSelector,
  stakingFeeSelector,
  withdrawInvestInputValue,
  (withdrawInvest, fee, inputValue) => () => {
    try {
      if (!withdrawInvest) return MESSAGES.STAKING_POOL_NOT_FOUND;
      const { maxWithdrawAmount, maxWithdrawAmountSymbolStr } = withdrawInvest;
      const { feeAmount, feeToken } = fee;
      if (new BigNumber(feeAmount).gt(feeToken.amount)) {
        return MESSAGES.NOT_ENOUGH_PRV_NETWORK_FEE;
      }
      if (new BigNumber(inputValue).gt(maxWithdrawAmount)) {
        return MESSAGES.STAKING_MAX(maxWithdrawAmountSymbolStr);
      }
    } catch (error) {
      return error.message;
    }
  },
);

export const withdrawInvestDisable = createSelector(
  withdrawInvestInputValue,
  withdrawInvestValidate,
  (inputValue, validate) => (inputValue <= 0 || !!validate()),
);

export const withdrawCoinsSelector = createSelector(
  withdrawInvestInputValue,
  withdrawInvestCoinSelector,
  stakingFeeSelector,
  (inputValue, investCoin, { feeAmount }) => {
    if (!investCoin) return;
    const { withdrawInvest } = investCoin;
    let { withdrawableCoins } = withdrawInvest;
    withdrawableCoins = orderBy(withdrawableCoins, 'amount', 'acs');
    let amountCount = new BigNumber(0);
    const withdrawCoins = withdrawableCoins.reduce((prev, curr) => {
      if (new BigNumber(inputValue).gt(amountCount)) {
        const { amount, nftId, tokenId } = curr;
        const unstakeAmount =
          new BigNumber(amountCount.plus(amount)).lt(inputValue) ?
            new BigNumber(amount) :
            new BigNumber(inputValue).minus(amountCount);
        prev.push({
          fee: feeAmount,
          unstakingAmount: unstakeAmount.toString(),
          nftID: nftId,
          stakingTokenID: tokenId,
          stakingPoolID: tokenId,
        });
        amountCount = amountCount.plus(unstakeAmount);
      }
      return prev;
    }, []);
    return withdrawCoins;
  },
);

/**
 * ================================================================
 * =======================WITHDRAW REWARD==========================
 * ================================================================
 **/
export const stakingWithdrawRewardSelector = createSelector(
  stakingSelector,
  (staking) => staking.withdrawReward,
);

export const withdrawRewardCoinSelector = createSelector(
  stakingWithdrawRewardSelector,
  stakingCoinByTokenIDSelector,
  ({ tokenID }, getStakingCoinByTokenID) => getStakingCoinByTokenID(tokenID),
);

const withdrawRewardInputValue = createSelector(
  (state) => state,
  withdrawRewardCoinSelector,
  (state, coin) => {
    const selector = formValueSelector(formConfigsWithdrawReward.formName);
    const inputText = selector(state, formConfigsWithdrawReward.input);
    const inputNumber = convert.toNumber(inputText, true) || 0;
    return convert.toOriginalAmount(inputNumber, coin.token.pDecimals);
  }
);

export const withdrawRewardValidate = createSelector(
  withdrawRewardCoinSelector,
  stakingFeeSelector,
  withdrawRewardInputValue,
  (coin, fee, inputValue) => () => {
    try {
      const { rewardBalance } = coin;
      const { feeAmount, feeToken } = fee;
      const { amount: userBalanceForFee } = feeToken;
      if (feeAmount > userBalanceForFee) {
        return MESSAGES.NOT_ENOUGH_PRV_NETWORK_FEE;
      } else if (inputValue > rewardBalance) {
        return MESSAGES.BALANCE_INSUFFICIENT;
      }
    } catch (error) {
      return error.message;
    }
  },
);

export const withdrawRewardInputAmount = createSelector(
  withdrawRewardInputValue,
  withdrawRewardCoinSelector,
  stakingFeeSelector,
  (inputValue, coin) => {
    const { token, rewardBalance } = coin;
    const inputText = formatUtil.amountFull(inputValue, token.pDecimals);
    const maxDepositHumanAmount = convert.toHumanAmount(rewardBalance, token.pDecimals);
    const maxDepositText = formatUtil.toFixed(maxDepositHumanAmount, token.pDecimals);
    return {
      inputText,
      inputValue,
      maxDepositValue: rewardBalance,
      maxDepositText,
    };
  }
);

export const withdrawRewardDisable = createSelector(
  withdrawRewardInputValue,
  withdrawRewardValidate,
  (inputValue, validate) => (inputValue <= 0 || !!validate()),
);

/**
 * ================================================================
 * =======================HISTORIES==========================
 * ================================================================
 **/
export const stakingHistoriesKeySelector = createSelector(
  stakingSelector,
  (staking) => {
    const { tokenID, nftID } = staking.histories;
    const key = getHistoriesKey({ tokenID, nftID });
    return {
      tokenID,
      nftID,
      key
    };
  },
);

export const stakingHistoriesSelector = createSelector(
  stakingSelector,
  stakingHistoriesKeySelector,
  (staking, { key }) => staking.histories?.data[key],
);

export const stakingHistoriesStatus = createSelector(
  stakingSelector,
  (staking) => {
    const { isFetching: isLoading, isFetched: isLoaded } = staking.histories;
    const isFetching = isLoading && !isLoaded;
    const isLoadMore = isLoading && isLoaded;
    return {
      isFetching,
      isLoadMore,
    };
  },
);

export const stakingHistoriesMapperSelector = createSelector(
  stakingHistoriesSelector,
  selectedPrivacy.getPrivacyDataByTokenID,
  (histories, getPrivacyDataByTokenID) => {
    return (histories || []).map((history) => {
      const { tokenId, amount, requestTime, status, rewardTokens } = history;
      const token = getPrivacyDataByTokenID(tokenId);
      const amountStr = formatUtil.amountFull(amount, token.pDecimals);
      const amountSymbolStr = `${amountStr} ${token.symbol}`;
      const timeStr = formatUtil.formatDateTime(requestTime * 1000);
      let statusColor;
      if (ACCOUNT_CONSTANT.TX_STAKING_STATUS.TXSTATUS_PENDING === status) {
        statusColor = COLORS.lightGrey33;
      } else if (ACCOUNT_CONSTANT.TX_STAKING_STATUS.TXSTATUS_SUCCESS === status) {
        statusColor = COLORS.green;
      } else {
        statusColor = COLORS.red2;
      }
      let rewards = undefined;
      if (rewardTokens) {
        rewards = Object.keys(rewardTokens || {}).map(tokenId => {
          const token = getPrivacyDataByTokenID(tokenId);
          const amountStr = formatUtil.amountFull(history.rewardTokens[tokenId], token.pDecimals);
          const amountSymbolStr = `${amountStr} ${token.symbol}`;
          return {
            token,
            amountStr,
            amountSymbolStr,
            rewards
          };
        });
      }
      const showRewardList = rewards && rewards.length > 0;
      return {
        ...history,
        token,
        amountStr,
        amountSymbolStr,
        timeStr,
        statusColor,
        rewards,
        showRewardList
      };
    });
  },
);

export default ({
  stakingFeeSelector,
  stakingPoolSelector,
  isFetchingPoolSelector,
  stakingPoolByTokenId,

  mapperStakingCoins,
  stakingCoinsSelector,
  stakingRewardSelector,
  isFetchingCoinsSelector,
  isExistStakingSelector,
  stakingCoinByTokenIDSelector,

  stakingHistoriesMapperSelector,
  stakingHistoriesKeySelector,
  stakingHistoriesStatus,

  stakingInvestSelector,
  investPoolSelector,
  investInputAmount,
  investInputValidate,
  investButton,
  investStakingCoinSelector,
  withdrawCoinsSelector,

  withdrawInvestCoinSelector,
  withdrawInvestValidate,
  withdrawInvestInputSelector,
  withdrawInvestDisable,

  withdrawRewardCoinSelector,
});
