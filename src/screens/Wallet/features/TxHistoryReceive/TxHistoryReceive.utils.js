// import { CONSTANT_COMMONS } from '@src/constants';
// import isEmpty from 'lodash/isEmpty';

export const getTypeOfHistoryReceive = ({ selectedPrivacy, tx }) => {
  let typeText = `Receive ${selectedPrivacy?.externalSymbol ||
    selectedPrivacy?.symbol}`;
  // try {
  //   const metaData = tx?.Metadata && JSON.parse(tx?.Metadata);
  //   if (metaData && metaData?.Type) {
  //     const type = metaData?.Type;
  //     typeText =
  //       CONSTANT_COMMONS.HISTORY.TYPE_HISTORY_RECEIVE[type] || typeText;
  //   } else if (
  //     isEmpty(tx?.PrivacyCustomTokenProofDetail?.InputCoins) &&
  //     !isEmpty(tx?.PrivacyCustomTokenProofDetail?.OutputCoins)
  //   ) {
  //     typeText = 'Minted Token';
  //   }
  // } catch (error) {
  //   console.debug('ERROR', error);
  // }
  return typeText;
};
