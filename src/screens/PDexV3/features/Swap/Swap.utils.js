import React from 'react';
import { PANCAKE_CONSTANTS } from 'incognito-chain-web-js/build/wallet';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import Web3 from 'web3'; // ETH sdk
import toLower from 'lodash/toLower';
import { Token, TokenAmount, JSBI, Trade, Pair } from '@pancakeswap/sdk';
import secp256k1 from 'secp256k1';
import bs58 from 'bs58';
import eutil from 'ethereumjs-util';
import Wallet from 'ethereumjs-wallet';
import { PRV } from '@src/constants/common';
import SelectedPrivacy from '@src/models/selectedPrivacy';
import isNaN from 'lodash/isNaN';
import convert from '@src/utils/convert';
import format from '@src/utils/format';
import BigNumber from 'bignumber.js';
import { formValueSelector } from 'redux-form';
import floor from 'lodash/floor';
import { Text } from 'react-native';
import routeNames from '@routers/routeNames';
import { formConfigs, KEYS_PLATFORMS_SUPPORTED } from './Swap.constant';

export const minFeeValidator = (feetokenData, isFetching) => {
  if (!feetokenData || isFetching) {
    return undefined;
  }
  try {
    const { origininalFeeAmount, minFeeOriginal, symbol, minFeeAmountText } =
      feetokenData;
    if (new BigNumber(origininalFeeAmount).lt(minFeeOriginal)) {
      return `Amount must be greater than ${minFeeAmountText} ${symbol}`;
    }
  } catch (error) {
    console.log('minFeeValidator-error', error);
  }
  return undefined;
};

export const maxFeeValidator = ({
  originalAmount,
  availableOriginalAmount,
  selltoken,
  feetoken,
  origininalFeeAmount,
  prvBalance,
  networkfee,
  isFetching,
}) => {
  try {
    if (isFetching) {
      return undefined;
    }
    const sellTokenIsPRV = selltoken === PRV.id;
    const payFeeByPRV = feetoken === PRV.id;
    let msg = 'Your balance is insufficient';
    if (sellTokenIsPRV) {
      let availableOriginalPRVFeeAmount = new BigNumber(prvBalance)
        .minus(originalAmount)
        .minus(origininalFeeAmount)
        .minus(networkfee);
      if (availableOriginalPRVFeeAmount.lt(0)) {
        return msg;
      }
    } else {
      if (payFeeByPRV) {
        let availableOriginalPRVFeeAmount = new BigNumber(prvBalance)
          .minus(origininalFeeAmount)
          .minus(networkfee);
        if (availableOriginalPRVFeeAmount.lt(0)) {
          return msg;
        }
      } else {
        let availableOriginalFeeAmount = new BigNumber(availableOriginalAmount)
          .minus(originalAmount)
          .minus(origininalFeeAmount);
        if (availableOriginalFeeAmount.lt(0)) {
          return msg;
        }
      }
    }
  } catch (error) {
    console.log('maxFeeValidator-error', error);
  }
  return undefined;
};

export const availablePayFeeByPRVValidator = ({
  origininalFeeAmount,
  prvBalance = 0,
  usingFeeBySellToken,
  networkfee,
} = {}) => {
  if (usingFeeBySellToken) {
    return undefined;
  }
  try {
    let availablePRVBalance = new BigNumber(prvBalance)
      .minus(origininalFeeAmount)
      .minus(networkfee);
    if (availablePRVBalance.isLessThan(0)) {
      return `Your ${PRV.symbol} balance is insufficient.`;
    }
  } catch (error) {
    console.log('availablePayFeeByPRVValidator-error', error);
  }
  return undefined;
};

export const maxAmountValidatorForPRVSellInput = (
  sellInputAmount,
  buyInputAmount,
  feetokenData,
  navigation,
  swapInfo,
  inputValue,
  privacyPRVInfo,
  totalFeePRV
) => {
  // console.log('[LOG]', {
  //   sellInputAmount,
  //   buyInputAmount,
  //   feetokenData,
  //   navigation,
  //   swapInfo,
  //   inputValue,
  //   privacyPRVInfo,
  //   totalFeePRV
  // });

  if (!sellInputAmount || !buyInputAmount) {
    return undefined;
  }

  const {
    originalAmount,
    symbol,
    tokenData,
    tokenId,
    pDecimals,
  } = sellInputAmount || {};

  const sellTokenIsPRV = tokenId === PRV.id;

  if (!sellTokenIsPRV) return undefined;

  const { prvBalanceOriginal, feePerTx } = privacyPRVInfo;

  // Repare value for comparation
  const totalFeePRVBN = new BigNumber(totalFeePRV);
  const prvBalanceOriginalBN = new BigNumber(prvBalanceOriginal);
  const originalAmountBN = new BigNumber(originalAmount);
  const feePerTxBN = new BigNumber(feePerTx);

  const onMessagePress = () => {
    navigation.navigate(routeNames.ChooseNetworkForShield, {
      tokenSelected: tokenData,
    });
  };

  // Input > Balance
  if (originalAmountBN.isGreaterThanOrEqualTo(prvBalanceOriginalBN)) {
    return (
      <Text onPress={onMessagePress}>
        {`Your ${PRV.symbol} balance is insufficient.`}
      </Text>
    );
  }

  // Balance < TotalFee 
  if (prvBalanceOriginalBN.lt(totalFeePRVBN)) {
    return (
      <Text onPress={onMessagePress}>
        {`Your ${PRV.symbol} balance is insufficient.`}
      </Text>
    );
  }

  // Balance < Network Fee + 0.1 = 0.2
  if (prvBalanceOriginalBN.lt(2*feePerTxBN)) {
    //By Pass, we have to go show popup-rerill-prv after
    return undefined;
  }

  // Input < Balance
  if (originalAmountBN.plus(totalFeePRVBN).gt(prvBalanceOriginalBN)) {
    const newInputValue = new BigNumber(prvBalanceOriginalBN - totalFeePRVBN).abs();
    const newInputValueNumber = convert.toHumanAmount(
      newInputValue,
      pDecimals,
    );
    const newInputValueText = format.toFixed(
      newInputValueNumber,
      pDecimals,
    );
    return (
      <Text onPress={onMessagePress}>
        {`Max amount you can convert is ${newInputValueText} ${symbol}.`}
      </Text>
    );
  }
  return undefined;
};

export const maxAmountValidatorForSellInput = (
  sellInputAmount,
  buyInputAmount,
  feetokenData,
  navigation,
  swapInfo,
) => {
  try {
    if (!sellInputAmount || !buyInputAmount) {
      return undefined;
    }

    const {
      originalAmount,
      availableOriginalAmount,
      symbol,
      availableAmountText,
      tokenData,
      tokenId,
      pDecimals,
    } = sellInputAmount || {};

    const { networkfee = 0 } = swapInfo;
    const { prvBalance } = feetokenData;
    const sellTokenIsPRV = tokenId === PRV.id;

    const onMessagePress = () => {
      navigation.navigate(routeNames.ChooseNetworkForShield, {
        tokenSelected: tokenData,
      });
    };
    if (navigation && !availableOriginalAmount) {
      return (
        <Text onPress={onMessagePress}>
          Insufficient balance.{' '}
          <Text style={{ textDecorationLine: 'underline' }}>Add funds</Text>.
        </Text>
      );
    }
    if (!availableOriginalAmount) {
      return 'Insufficient balance.';
    }

    if (sellTokenIsPRV) {
      if (new BigNumber(networkfee).gt(new BigNumber(prvBalance))) {
        return (
          <Text onPress={onMessagePress}>
            {`Your ${PRV.symbol} balance is insufficient.`}
          </Text>
        );
      }
    }
    if (!buyInputAmount.amountText || buyInputAmount.amountText.length < 1) {
      if (
        new BigNumber(originalAmount).gt(new BigNumber(availableOriginalAmount))
      ) {
        return (
          <Text onPress={onMessagePress}>
            {`Max amount you can convert is ${availableAmountText} ${symbol}.`}
            &nbsp;
            <Text style={{ textDecorationLine: 'underline' }}>Add funds</Text>.
          </Text>
        );
      }
    } else {
      if (tokenId === feetokenData.tokenId) {
        const fee = feetokenData.minFeeOriginal;
        if (
          new BigNumber(originalAmount)
            .plus(fee)
            .gt(new BigNumber(availableOriginalAmount))
        ) {
          let availableAmountNumber = convert.toHumanAmount(
            availableOriginalAmount - fee,
            pDecimals,
          );
          if (new BigNumber(availableAmountNumber).lt(0)) {
            return (
              <Text onPress={onMessagePress}>
                Your balance is insufficient.{' '}
                <Text style={{ textDecorationLine: 'underline' }}>
                  Add funds
                </Text>
              </Text>
            );
          }
          let availableAmountTextAfterMinusFee = format.toFixed(
            availableAmountNumber,
            pDecimals,
          );
          return (
            <Text onPress={onMessagePress}>
              {`Max amount you can convert is ${availableAmountTextAfterMinusFee} ${symbol}.`}
              &nbsp;
              <Text style={{ textDecorationLine: 'underline' }}>Add funds</Text>
              .
            </Text>
          );
        }
      } else {
        if (
          new BigNumber(originalAmount).gt(
            new BigNumber(availableOriginalAmount),
          )
        ) {
          return (
            <Text onPress={onMessagePress}>
              {`Max amount you can convert is ${availableAmountText} ${symbol}.`}
              &nbsp;
              <Text style={{ textDecorationLine: 'underline' }}>Add funds</Text>
              .
            </Text>
          );
        }
      }
    }
  } catch (error) {
    console.log('maxAmountValidatorForSellInput-error', error);
  }

  return undefined;
};

export const maxAmountValidatorForSlippageTolerance = (slippagetolerance) => {
  try {
    if (!slippagetolerance) {
      return undefined;
    }
    let slippagetoleranceAmount = convert.toNumber(slippagetolerance, true);
    if (isNaN(slippagetoleranceAmount) || !slippagetoleranceAmount) {
      return 'Must be a number';
    }
    if (slippagetoleranceAmount >= 100) {
      return `Enter a number from 0 to ${format.number(99.99)} `;
    }
  } catch (error) {
    console.log('maxAmountValidatorForSlippageTolerance-error', error);
  }

  return undefined;
};

export const getInputAmount =
  (state, getInputToken, focustoken, feeData, isGettingBalance) => (field) => {
    try {
      const token: SelectedPrivacy = getInputToken(field);
      if (!token.tokenId) {
        return {
          amount: '',
          originalAmount: 0,
          isFocus: false,
        };
      }
      const selector = formValueSelector(formConfigs.formName);
      const amountText = selector(state, field);
      let amount = convert.toNumber(amountText, true) || 0;
      const originalAmount = convert.toOriginalAmount(amount, token.pDecimals);
      let availableOriginalAmount = token.amount || 0;
      let availableAmountNumber = convert.toHumanAmount(
        availableOriginalAmount,
        token.pDecimals,
      );
      let availableAmountText = format.toFixed(
        availableAmountNumber,
        token.pDecimals,
      );
      const usingFee =
        token.tokenId === feeData.feetoken && field === formConfigs.selltoken;
      const focus = token.tokenId === focustoken;
      return {
        focus,
        tokenId: token.tokenId,
        symbol: token.symbol,
        pDecimals: token.pDecimals,
        isMainCrypto: token.isMainCrypto,

        amount,
        originalAmount,
        amountText,

        availableOriginalAmount,
        availableAmountText,
        availableAmountNumber,

        usingFee,
        loadingBalance: isGettingBalance.includes(token.tokenId),

        balance: token.amount,
        balanceStr: format.amountVer2(token.amount, token.pDecimals),

        tokenData: token,
      };
    } catch (error) {
      console.log('inputAmountSelector error', error);
    }
  };

export const calMintAmountExpected = ({ maxGet, slippagetolerance } = {}) => {
  try {
    let maxGetBn = new BigNumber(maxGet);
    const amount = floor(
      maxGetBn.minus(maxGetBn.multipliedBy(slippagetolerance / 100)).toNumber(),
    );
    return amount;
  } catch (error) {
    console.log('error', error);
  }
  return maxGet;
};

//

export async function getBestRateFromPancake(params) {
  let {
    sourceToken,
    destToken,
    amount,
    isSwapFromBuyToSell,
    listDecimals,
    bscConfigs,
    pancakeConfigs,
  } = params;
  let {
    routerV2: pancakeRouterV2,
    factoryAddress: pancakeFactoryAddress,
    chainID: pancakeChainID,
    multiCallContract: pancakeMultiCallContract,
  } = pancakeConfigs;
  const listCommon = [...Object.keys(listDecimals)]; // pairs token => sell/buy token -> find best rate
  const web3 = new Web3(bscConfigs.host);
  const MULTI_CALL_INST = new web3.eth.Contract(
    PANCAKE_CONSTANTS.MULTI_CALL_ABI,
    pancakeMultiCallContract,
  );
  const FACTORY_INST = new web3.eth.Contract(
    PANCAKE_CONSTANTS.PANCAKE_FACTORY_ABI,
    pancakeFactoryAddress,
  );
  const PANCAKE_ROUTER_INST = new web3.eth.Contract(
    PANCAKE_CONSTANTS.PANCAKE_ABI,
    pancakeRouterV2,
  );
  let pairList = [];
  // get list LPs
  let abiCallGetLPs = [];
  let token_pair = [];
  let listTokens = listCommon.slice();
  let listTokenDecimals = Object.assign({}, listDecimals);
  try {
    [sourceToken, destToken].forEach(function (item) {
      if (!listTokenDecimals[toLower(item.contractIdGetRate)]) {
        listTokenDecimals[toLower(item.contractIdGetRate)] = {
          decimals: item.decimals,
          symbol: item.symbol,
        };
        listTokens.push(item.contractIdGetRate);
      }
    });
  } catch (error) {
    console.log('ERROR', error);
  }
  for (let i = 0; i < listTokens.length - 1; i++) {
    for (let j = i + 1; j < listTokens.length; j++) {
      if (toLower(listTokens[i]) === toLower(listTokens[j])) continue;
      const temp = FACTORY_INST.methods
        .getPair(listTokens[i], listTokens[j])
        .encodeABI();
      abiCallGetLPs.push([pancakeFactoryAddress, temp]);
      token_pair.push({ token0: listTokens[i], token1: listTokens[j] });
    }
  } // pair sell / buy: [{sell, buy}]

  // detect exited pair between sell/buy in pancake
  const listLPs = await MULTI_CALL_INST.methods
    .tryAggregate(false, abiCallGetLPs)
    .call();
  let listPairExist = [];
  let getPairResrved = [];
  for (let i = 0; i < listLPs.length; i++) {
    if (!listLPs[i].success) {
      continue;
    }
    const contractLPAddress = '0x' + listLPs[i].returnData.substring(26);
    if (contractLPAddress === '0x0000000000000000000000000000000000000000') {
      continue;
    }
    const contractTemp = new web3.eth.Contract(
      PANCAKE_CONSTANTS.PANCAKE_PAIR_ABI,
      contractLPAddress,
    );
    const temp = contractTemp.methods.getReserves().encodeABI();
    const temp2 = contractTemp.methods.token0().encodeABI();
    getPairResrved.push([contractLPAddress, temp]);
    getPairResrved.push([contractLPAddress, temp2]);
    listPairExist.push(token_pair[i]);
  }

  if (getPairResrved.length === 0) {
    console.log('no LPs exist!!!');
    return null, null;
  }

  // get rate of pair
  const listReserved = await MULTI_CALL_INST.methods
    .tryAggregate(false, getPairResrved)
    .call();
  if (listReserved.length < 2) {
    console.log('no LPs exist!!!');
    return null, null;
  }

  for (let i = 0; i < listReserved.length; i += 2) {
    const reserve0 = JSBI.BigInt(
      '0x' + listReserved[i].returnData.substring(2, 66),
      16,
    );
    const reserve1 = JSBI.BigInt(
      '0x' + listReserved[i].returnData.substring(66, 130),
      16,
    );
    const token0 = '0x' + listReserved[i + 1].returnData.substring(26);
    let token1 = listPairExist[i / 2].token1;
    if (listPairExist[i / 2].token0.toLowerCase() !== token0.toLowerCase()) {
      token1 = listPairExist[i / 2].token0;
    }
    const token0Ins = new Token(
      pancakeChainID,
      token0,
      listTokenDecimals[toLower(token0)].decimals,
      listTokenDecimals[toLower(token0)].symbol,
    );
    const token1Ins = new Token(
      pancakeChainID,
      token1,
      listTokenDecimals[toLower(token1)].decimals,
      listTokenDecimals[toLower(token1)].symbol,
    );
    const pair = new Pair(
      new TokenAmount(token0Ins, reserve0),
      new TokenAmount(token1Ins, reserve1),
    );
    pairList.push(pair);
  }
  const sellOriginalAmount = convert.toOriginalAmount(
    amount,
    isSwapFromBuyToSell ? destToken.decimals : sourceToken.decimals,
  );
  const sellAmount = JSBI.BigInt(sellOriginalAmount);
  const seltTokenInst = new Token(
    pancakeChainID,
    sourceToken.contractIdGetRate,
    sourceToken.decimals,
    sourceToken.symbol,
  );
  const buyTokenInst = new Token(
    pancakeChainID,
    destToken.contractIdGetRate,
    destToken.decimals,
    destToken.symbol,
  );
  let result;
  if (!isSwapFromBuyToSell) {
    result = Trade.bestTradeExactIn(
      // find best route
      pairList,
      new TokenAmount(seltTokenInst, sellAmount),
      buyTokenInst,
      { maxNumResults: 1 },
    );
  } else {
    result = Trade.bestTradeExactOut(
      pairList,
      seltTokenInst,
      new TokenAmount(buyTokenInst, sellAmount),
      { maxNumResults: 1 },
    );
  }
  if (result.length === 0) {
    console.log('Can not find the best path for this pair');
    return null, null;
  }
  const priceImpact = result[0]?.priceImpact.toSignificant(18);
  const bestPath = result[0].route.path;
  let paths = [];
  bestPath.forEach(function (item) {
    paths.push(item.address);
  });
  let outputs;
  if (!isSwapFromBuyToSell) {
    outputs = await PANCAKE_ROUTER_INST.methods
      .getAmountsOut(sellAmount.toString(), paths)
      .call();
  } else {
    outputs = await PANCAKE_ROUTER_INST.methods
      .getAmountsIn(sellAmount.toString(), paths)
      .call();
  }
  return { paths, outputs, impactAmount: Number(priceImpact) };
}

// generated eth from incKey success
export function genETHAccFromIncPrivKey(incPrivKey) {
  const web3 = new Web3();
  let bytes = bs58.decode(incPrivKey);
  bytes = bytes.slice(1, bytes.length - 4);
  const privHexStr = web3.utils.bytesToHex(bytes);
  let privKey = web3.utils.keccak256(privHexStr);
  let temp, temp2;
  temp = web3.utils.hexToBytes(privKey);
  temp2 = new Uint8Array(temp);
  while (!secp256k1.privateKeyVerify(temp2)) {
    privKey = web3.utils.keccak256(privKey);
    temp = web3.utils.hexToBytes(privKey);
    temp2 = new Uint8Array(temp);
  }
  const fixturePrivateBuffer = Buffer.from(privKey.replace('0x', ''), 'hex');
  const fixtureWallet = Wallet.fromPrivateKey(fixturePrivateBuffer);
  return fixtureWallet;
}

export function signMessage(mess, privateKey) {
  let dataToSigBuff = Buffer.from(mess.replace('0x', ''), 'hex');
  let privateKeyBuff = Buffer.from(privateKey.replace('0x', ''), 'hex');
  let signature = eutil.ecsign(dataToSigBuff, privateKeyBuff);
  return (
    '0x' +
    signature.r.toString('hex') +
    signature.s.toString('hex') +
    '0' +
    (signature.v - 27).toString(16)
  );
}

export const findBestRateOfMaxBuyAmount = (arr) => {
  let _arr = arr.filter((platform) =>
    new BigNumber(platform?.amount).isGreaterThan(0),
  );
  return maxBy(_arr, (platform) => platform?.amount);
};

export const findBestRateOfMinSellAmount = (arr) =>
  minBy(
    arr.filter((platform) => new BigNumber(platform?.amount).isGreaterThan(0)),
    (platform) => platform?.amount,
  );

export const getMaxAmount = ({
  amount,
  isMainCrypto,
  pDecimals,
  isUseTokenFee,
  totalFee,
}) => {
  let amountNumber = amount;
  if (isUseTokenFee || isMainCrypto) {
    const newAmount = amountNumber - totalFee;
    amountNumber = Math.max(newAmount, 0);
  }
  const maxAmount = Math.max(floor(amountNumber), 0);
  const maxAmountText = format.toFixed(
    convert.toHumanAmount(maxAmount, pDecimals),
    pDecimals,
  );
  return {
    maxAmount,
    maxAmountText,
  };
};

export const getNetworkByExchange = (exchange) => {
  let network;
  switch (exchange) {
    case KEYS_PLATFORMS_SUPPORTED.pancake:
      network = 'bsc';
      break;
    case KEYS_PLATFORMS_SUPPORTED.curve:
      network = 'plg';
      break;
    case KEYS_PLATFORMS_SUPPORTED.uni:
    case KEYS_PLATFORMS_SUPPORTED.uniEther:
      network = 'inc';
      break;
    case KEYS_PLATFORMS_SUPPORTED.spooky:
      network = 'ftm';
      break;
    case KEYS_PLATFORMS_SUPPORTED.joe:
      network = 'avax';
      break;
    case KEYS_PLATFORMS_SUPPORTED.trisolaris:
      network = 'aurora';
      break;
    default:
      network = 'inc';
      break;
  }
  return network;
};
