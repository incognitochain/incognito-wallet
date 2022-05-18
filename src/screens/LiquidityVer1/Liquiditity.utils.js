import { INPUT_FIELDS } from '@screens/Dex/Liquidity.constants';
import BigNumber from 'bignumber.js';
import difference from 'lodash/difference';

export const combineData = ({ feePairs, userPairs }) => {
  const diffFeePairs = difference(feePairs, userPairs, 'shareKey');
  console.log('SANG TEST::: ', { feePairs, userPairs, diffFeePairs });
  // const { share, totalShare, userPair } = shareValueSelector(inputToken, outputToken);
  // const { maxInputShare: maxInput, maxOutputShare: maxOutput } = liquidity[INPUT_FIELDS.REMOVE_POOL];
  // const poolInputValue = userPair[inputToken.id];
  // const poolOutputValue = userPair[outputToken.id];
  // const sharePercent = new BigNumber(share).dividedBy(totalShare).toNumber();
  // const maxInputShare = new BigNumber(sharePercent).multipliedBy(poolInputValue).toNumber() || 0; // Max_Token_A
  // const maxOutputShare = new BigNumber(sharePercent).multipliedBy(poolOutputValue).toNumber() || 0; // Max_Token_B
};