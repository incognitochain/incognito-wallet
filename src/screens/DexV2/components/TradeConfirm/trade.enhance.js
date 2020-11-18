import React from 'react';
import { MESSAGES } from '@screens/Dex/constants';
import { PRV } from '@services/wallet/tokenService';
import { COINS } from '@src/constants';
import { ExHandler } from '@services/exception';
import accountService from '@services/wallet/accountService';
import { deposit as depositAPI, trade as tradeAPI } from '@services/api/pdefi';
import { MAX_PDEX_TRADE_STEPS } from '@screens/DexV2/constants';
import { apiTradePKyber } from '@screens/DexV2';
import convertUtil from '@utils/convert';
import { useDispatch } from 'react-redux';
import { actionAddFollowToken } from '@src/redux/actions/token';
import { actionLogEvent } from '@src/screens/Performance';

const withTrade = (WrappedComp) => (props) => {
  const [error, setError] = React.useState('');
  const [trading, setTrading] = React.useState(false);
  const {
    inputValue,
    inputToken,
    inputBalance,
    outputToken,
    outputValue,
    minimumAmount,
    prvBalance,
    fee,
    feeToken,
    onTradeSuccess,
    wallet,
    account,
    isErc20,
    quote,
  } = props;
  const erc20Fee = isErc20 ? quote?.erc20Fee : 0;
  const dispatch = useDispatch();
  const deposit = () => {
    let type = 1;
    if (isErc20 && !quote?.crossTrade) {
      if (quote.protocol.toLowerCase() === 'kyber') {
        type = 2;
      } else {
        type = 4;
      }
    }
    return depositAPI({
      tokenId: inputToken.id,
      amount: inputValue,
      networkFee:
        (fee / MAX_PDEX_TRADE_STEPS) * (MAX_PDEX_TRADE_STEPS - 1) + erc20Fee,
      networkFeeTokenId: feeToken.id,
      receiverAddress: account.PaymentAddress,
      type,
    });
  };

  const trade = async () => {
    let prvFee = 0;
    let tokenFee = 0;
    let spendingPRV = false;
    let spendingCoin = false;
    if (trading) {
      return;
    }
    setTrading(true);
    setError('');
    try {
      if (inputToken?.id === PRV.id) {
        prvFee = fee;
        tokenFee = fee;
      } else {
        prvFee = feeToken.id === COINS.PRV_ID ? fee : 0;
        tokenFee = prvFee > 0 ? 0 : fee;
      }
      if (inputBalance < inputValue + tokenFee) {
        return setError(
          MESSAGES.NOT_ENOUGH_BALANCE_TO_TRADE(inputToken.symbol),
        );
      }
      if (prvBalance < prvFee + erc20Fee) {
        return setError(MESSAGES.NOT_ENOUGH_PRV_NETWORK_FEE);
      }

      if (inputToken?.id === PRV.id) {
        spendingCoin = spendingPRV = await accountService.hasSpendingCoins(
          account,
          wallet,
          inputValue + prvFee + erc20Fee,
        );
      } else {
        if (prvFee) {
          spendingPRV = await accountService.hasSpendingCoins(
            account,
            wallet,
            prvFee + erc20Fee,
          );
          spendingCoin = await accountService.hasSpendingCoins(
            account,
            wallet,
            inputValue,
            inputToken.id,
          );
        } else {
          spendingCoin = await accountService.hasSpendingCoins(
            account,
            wallet,
            inputValue + tokenFee,
            inputToken.id,
          );
        }
      }
      if (spendingCoin || spendingPRV) {
        return setError(MESSAGES.PENDING_TRANSACTIONS);
      }
      const depositObject = await deposit();
      const serverFee =
        (tokenFee / MAX_PDEX_TRADE_STEPS) * (MAX_PDEX_TRADE_STEPS - 1);
      const tokenNetworkFee = tokenFee / MAX_PDEX_TRADE_STEPS;
      const prvNetworkFee = prvFee / MAX_PDEX_TRADE_STEPS;
      let prvAmount =
        (prvFee / MAX_PDEX_TRADE_STEPS) * (MAX_PDEX_TRADE_STEPS - 1);

      if (isErc20 && !quote?.crossTrade) {
        await tradeKyber(depositObject.depositId);
        prvAmount = prvAmount + erc20Fee;
      } else {
        const payload = {
          depositId: depositObject.depositId,
          buyTokenId: outputToken.id,
          buyAmount: outputValue,
          buyExpectedAmount: outputValue,
          tradingFee: 0,
          minimumAmount,
        };
        await tradeAPI(payload);
      }
      const result = await accountService.createAndSendToken(
        account,
        wallet,
        depositObject.walletAddress,
        inputValue + serverFee,
        inputToken.id,
        prvNetworkFee,
        tokenNetworkFee,
        prvAmount,
      );
      if (result && result.txId) {
        onTradeSuccess(true);
      }
    } catch (error) {
      if (error) {
        dispatch(actionLogEvent({
          desc: `Trade has error: ${error?.message || error}`
        }));
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
    const data = {
      SrcTokens: inputToken?.address,
      SrcQties: originalValue,
      DestTokens: outputToken?.address,
      DappAddress: quote?.dAppAddress,
      DepositId: depositId,
      ExpectAmount: quote?.expectAmount,
      MaxAmountOut: quote?.maxAmountOut,
      Fee: erc20Fee,
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
