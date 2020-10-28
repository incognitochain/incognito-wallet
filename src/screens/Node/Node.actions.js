import {
  ACTION_FETCH_FULL_INFO_FAIL,
  ACTION_FETCHED_FULL_INFO,
  ACTION_FETCHING_FULL_INFO,
  ACTION_UPDATE_COMBINE_REWARDS,
  ACTION_UPDATE_FETCHING,
  ACTION_UPDATE_LIST_NODE_DEVICE,
  ACTION_UPDATE_MISSING_SETUP,
  ACTION_UPDATE_WITH_DRAWING
} from '@screens/Node/Node.constant';
import tokenService, {PRV} from '@services/wallet/tokenService';
import {
  getBeaconBestStateDetail,
  listRewardAmount
} from '@services/wallet/RpcClientService';
import _ from 'lodash';
import {
  CustomError,
  ErrorCode
} from '@services/exception';
import { getTokenList } from '@services/api/token';

/**
* @param {Object<{
*   listDevice: array,
*   isFetching: boolean
* }>} payload
*/
export const actionUpdateListNodeDevice = (payload) => ({
  type: ACTION_UPDATE_LIST_NODE_DEVICE,
  payload,
});

/**
* @param {boolean} isFetching
*/
export const actionUpdateFetching = (isFetching) => ({
  type: ACTION_UPDATE_FETCHING,
  isFetching,
});

const actionFetchFullInfoFail = () => ({
  type: ACTION_FETCH_FULL_INFO_FAIL,
});

const actionFetchingFullInfo = () => ({
  type: ACTION_FETCHING_FULL_INFO,
});

/**
* @param {Object<{
*   committees: array,
*   nodeRewards: object
*   allTokens: array
* }>} payload
*/
const actionFetchedFullInfo = (payload) => ({
  type: ACTION_FETCHED_FULL_INFO,
  payload
});

/**
* response
* * @allTokens
* * @committees
* * @nodeRewards
**/
export const actionGetNodeFullInfo = (allTokens = [PRV]) => async (dispatch) => {
  // const chainInfo = await getBlockChainInfo();
  // const beacon = chainInfo.BestBlocks['-1'];
  // const currentHeight = beacon.Height;
  let committees = {
    AutoStaking: [],
    ShardPendingValidator: {},
    CandidateShardWaitingForNextRandom: [],
    CandidateShardWaitingForCurrentRandom: [],
    ShardCommittee: {},
  };
  let nodeRewards = {};
  try {
    dispatch(actionFetchingFullInfo());
    const promises = [];
    const cPromise = getBeaconBestStateDetail().then(data => {
      if (!_.has(data, 'AutoStaking')) {
        throw new CustomError(ErrorCode.FULLNODE_DOWN);
      }
      committees = data || [];
    });
    promises.push(cPromise);

    const rPromise = listRewardAmount()
      .then(async data => {
        if (!data) {
          throw new CustomError(ErrorCode.FULLNODE_DOWN);
        }
        nodeRewards = data || {};
        let tokenIds = [];

        _.forEach(nodeRewards, reward => tokenIds.push(Object.keys(reward)));
        tokenIds = _.flatten(tokenIds);
        tokenIds = _.uniq(tokenIds);

        let tokenDict = tokenService.flatTokens(allTokens);
        if (tokenIds.some(id => !tokenDict[id])) {
          const pTokens = await getTokenList();
          allTokens = tokenService.mergeTokens(allTokens, pTokens);
          tokenDict = tokenService.flatTokens(allTokens);
          if (tokenIds.some(id => !tokenDict[id])) {
            const chainTokens = await tokenService.getPrivacyTokens();
            allTokens = tokenService.mergeTokens(chainTokens, allTokens);
          }
        }
      });
    promises.push(rPromise);
    await Promise.all(promises);
    dispatch(actionFetchedFullInfo({
      committees,
      nodeRewards,
      allTokens
    }));
  } catch (error) {
    dispatch(actionFetchFullInfoFail({
      committees,
      nodeRewards,
      allTokens
    }));
  }
};

export const actionUpdateWithdrawing = (withdrawing) => ({
  type: ACTION_UPDATE_WITH_DRAWING,
  withdrawing,
});

export const actionUpdateCombineRewards = (payload) => ({
  type: ACTION_UPDATE_COMBINE_REWARDS,
  payload
});

export const actionUpdateMissingSetup = (payload) => ({
  type: ACTION_UPDATE_MISSING_SETUP,
  payload
});





