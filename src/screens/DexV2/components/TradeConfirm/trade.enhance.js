import React from 'react';
import { MESSAGES, PRV_ID } from '@screens/Dex/constants';
import { COINS } from '@src/constants';
import { ExHandler } from '@services/exception';
import accountService from '@services/wallet/accountService';
import { ACCOUNT_CONSTANT } from 'incognito-chain-web-js/build/wallet';
import {
  deposit as depositAPI,
  trade as tradeAPI,
  submitRawDataPdexHandler,
} from '@services/api/pdefi';
import { MAX_PDEX_TRADE_STEPS } from '@screens/DexV2/constants';
import { apiTradePKyber } from '@screens/DexV2';
import convertUtil from '@utils/convert';
import { useDispatch, useSelector } from 'react-redux';
import { actionAddFollowToken } from '@src/redux/actions/token';
import { actionLogEvent } from '@src/screens/Performance';
import { getSlippagePercent } from '@screens/DexV2/components/Trade/TradeV2/Trade.utils';
import BigNumber from 'bignumber.js';
import { accountSelector } from '@src/redux/selectors';
import { walletSelector } from '@src/redux/selectors/wallet';

const withTrade = (WrappedComp) => (props) => {
  const [error, setError] = React.useState('');
  const [trading, setTrading] = React.useState(false);
  const account = useSelector(accountSelector.defaultAccountSelector);
  const wallet = useSelector(walletSelector);
  const {
    inputValue,
    inputToken,
    outputToken,
    minimumAmount,
    fee,
    feeToken,
    onTradeSuccess,
    // wallet,
    // account,
    isErc20,
    quote,
    tradingFee,
    slippage,
    priority,
  } = props;

  const dispatch = useDispatch();

  let depositFee = (fee / MAX_PDEX_TRADE_STEPS) * (MAX_PDEX_TRADE_STEPS - 1);

  const deposit = () => {
    let type = 1;
    if (isErc20 && !quote?.crossTrade) {
      if (quote.protocol.toLowerCase() === 'kyber') {
        type = 2;
      } else {
        type = 4;
      }
    }

    // deposit in PDEX, dont add network fee
    // deposit in PKYPER | UNISWAP, add network fee
    if (tradingFee && quote?.protocol && quote?.protocol !== 'PDex') {
      depositFee += tradingFee;
    }

    return depositAPI({
      tokenId: inputToken.id,
      amount: inputValue,
      networkFee: depositFee,
      networkFeeTokenId: feeToken.id,
      receiverAddress: account.PaymentAddress,
      type,
      priority,
      RawData: true,
    });
  };

  const trade = async () => {
    let prvFee = 0;
    let tokenFee = 0;
    // let spendingPRV = false;
    // let spendingCoin = false;
    if (trading) {
      return;
    }
    setTrading(true);
    setError('');
    try {
      // if (inputToken?.id === PRV_ID) {
      //   prvFee = fee;
      //   // tokenFee = fee;
      // } else {
      //   prvFee = feeToken.id === COINS.PRV_ID ? fee : 0;
      //   tokenFee = prvFee > 0 ? 0 : fee;
      // }
      // dispatch(actionLogEvent({ desc: 'TRADE START CHECK PENDING COIN' }));
      // dispatch(actionLogEvent({ desc: 'TRADE START DEPOSIT' }));
      // const depositObject = await deposit();
      // let serverFee =
      //   (tokenFee / MAX_PDEX_TRADE_STEPS) * (MAX_PDEX_TRADE_STEPS - 1);
      // if (feeToken.id === PRV_ID && inputToken?.id === PRV_ID) {
      //   serverFee += tradingFee;
      // }
      // const tokenNetworkFee = tokenFee / MAX_PDEX_TRADE_STEPS;
      // const prvNetworkFee = prvFee / MAX_PDEX_TRADE_STEPS;
      // let prvAmount =
      //   (prvFee / MAX_PDEX_TRADE_STEPS) * (MAX_PDEX_TRADE_STEPS - 1) +
      //   tradingFee;

      // if (isErc20 && !quote?.crossTrade) {
      //   dispatch(actionLogEvent({ desc: 'TRADE START TRADE PKYPER' }));
      //   await tradeKyber(depositObject.depositId);
      // } else {
      //   const payload = {
      //     depositId: depositObject.depositId,
      //     buyTokenId: outputToken.id,
      //     buyAmount: minimumAmount,
      //     buyExpectedAmount: minimumAmount,
      //     tradingFee: tradingFee,
      //     minimumAmount,
      //   };
      //   dispatch(actionLogEvent({ desc: 'TRADE START TRADE PDEX' }));
      //   await tradeAPI(payload);
      // }
      // dispatch(actionLogEvent({ desc: 'TRADE START SEND COIN TO WALLET' }));
      // const depositId = depositObject.depositId;
      // const result = await accountService.createAndSendToken(
      //   account,
      //   wallet,
      //   depositObject.walletAddress,
      //   inputValue + serverFee,
      //   inputToken.id,
      //   prvNetworkFee,
      //   tokenNetworkFee,
      //   prvAmount,
      //   '',
      //   null,
      //   depositId,
      //   submitRawDataPdexHandler
      // );
      // const tokenID = inputToken.id;
      // const paymentAddress = depositObject.walletAddress;
      // const paymentAddress =
      //   '12skvWhcpghKA5TZfGPdbKNCPFQmHNtep2Rm1u19E3f7eoikSUmAio59PEcrHA9jCDfRtEfcANm8dkRW1yoi3RgUnuhgSt8eT1EtWMfaWBTqLHNFAXK5RSvLRmrZ83zZG6uGw3yJgrZStHAHPqkn';
      // const amount = Math.floor(inputValue + serverFee);
      // const fee = prvAmount;
      // console.log('paymentAddress', paymentAddress, amount, fee);
      // return;
      // let result;
      // if (tokenID === PRVIDSTR) {
      //   result = await accountService.createAndSendNativeToken({
      //     wallet,
      //     account,
      //     prvPayments: [
      //       {
      //         PaymentAddress: paymentAddress,
      //         Amount: amount,
      //         Message: '',
      //       },
      //     ],
      //     fee: prvAmount,
      //     isEncryptMessage: true,
      //     txType: ACCOUNT_CONSTANT.TX_TYPE.PROVIDE,
      //   });
      // } else {
      //   result = await accountService.createAndSendPrivacyToken({
      //     wallet,
      //     account,
      //     prvPayments: [],
      //     tokenPayments: [
      //       {
      //         PaymentAddress: paymentAddress,
      //         Amount: amount,
      //         Message: '',
      //       },
      //     ],
      //     fee: prvAmount,
      //     tokenID,
      //     isEncryptMessage: true,
      //     isEncryptMessageToken: true,
      //     txType: ACCOUNT_CONSTANT.TX_TYPE.PROVIDE,
      //   });
      // }
      // console.log('RESULT TRADE', result);
      // dispatch(actionLogEvent({ desc: 'TRADE END SEND COIN TO WALLET' }));
      // dispatch(
      //   actionLogEvent({
      //     desc: `txId: ${result.txId}, rawData: ${result.rawData}`,
      //   }),
      // );
      // if (result && result.txId) {
      //   onTradeSuccess(true);
      // }
      const reqTrade = {
        account,
        wallet,
        fee,
        tokenIDToBuy: outputToken.id,
        tokenIDToSell: inputToken.id,
        sellAmount: inputValue,
        tradingFee,
        minAcceptableAmount: minimumAmount,
      };
      console.log('reqTrade', {
        fee,
        tokenIDToBuy: outputToken.id,
        tokenIDToSell: inputToken.id,
        sellAmount: inputValue,
        tradingFee,
        minAcceptableAmount: minimumAmount,
      });
      let result = await accountService.createAndSendTradeRequestTx(reqTrade);
      if (result?.txId) {
        onTradeSuccess(true);
      }
    } catch (error) {
      if (error) {
        dispatch(
          actionLogEvent({
            desc: `Trade has error: ${error?.message || error} with Code: ${
              error?.code
            }`,
          }),
        );
      }
      setError(new ExHandler(error).getMessage(MESSAGES.TRADE_ERROR));
    } finally {
      setTrading(false);
      dispatch(actionAddFollowToken(inputToken?.id));
      dispatch(actionAddFollowToken(outputToken?.id));
    }
  };

  const tradeKyber = async (depositId) => {
    const originalValue = convertUtil.toDecimals(inputValue, inputToken);
    const expectAmount = new BigNumber(quote?.expectAmount || '0')
      .multipliedBy(getSlippagePercent(slippage))
      .integerValue(BigNumber.ROUND_FLOOR)
      .toFixed();

    const maxAmountOut = new BigNumber(quote?.maxAmountOut || '0')
      .multipliedBy(getSlippagePercent(slippage))
      .integerValue(BigNumber.ROUND_FLOOR)
      .toNumber();

    const data = {
      SrcTokens: inputToken?.address,
      SrcQties: originalValue,
      DestTokens: outputToken?.address,
      DappAddress: quote?.dAppAddress,
      DepositId: depositId,
      ExpectAmount: expectAmount, // RatioTrade / slippage ? slippage * ratio trade
      MaxAmountOut: maxAmountOut, // AmountOutput / slippage ? slippage * amount out
      Fee: tradingFee,
      FeeLevel: priority.toLowerCase(),
    };
    await apiTradePKyber(data);
  };

  return (
    <WrappedComp
      {...{
        ...props,
        trading,
        onTrade: trade,
        error,
      }}
    />
  );
};

export default withTrade;
