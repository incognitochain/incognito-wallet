import { CONSTANT_COMMONS, TRADING } from '@src/constants';
import http from '@src/services/http';
import convertUtils from '@utils/convert';
import BigNumber from 'bignumber.js';

const { PROTOCOLS } = TRADING;

export const apiGetQuote = async ({
  inputToken,
  outputToken,
  protocol,
  amount,
}) => {
  const supportedProtocols = {
    [PROTOCOLS.KYBER]: apiGetKyberQuote,
  };
  const quote = await supportedProtocols[protocol]({
    inputToken,
    outputToken,
    amount,
  });
  return quote;
};

export const apiGetKyberQuote = async ({ inputToken, outputToken, amount }) => {
  let srcToken = inputToken?.address;
  let destToken = outputToken?.address;
  const originaAmount = convertUtils.toDecimals(amount, inputToken);
  if (inputToken.symbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ETH) {
    srcToken = '0x0000000000000000000000000000000000000000';
  }
  if (outputToken?.symbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ETH) {
    destToken = '0x0000000000000000000000000000000000000000';
  }

  const rates = await http.get(
    `uniswap/rate?SrcToken=${srcToken}&DestToken=${destToken}&Amount=${originaAmount}`,
  );
  const bestRate = rates?.ListRate?.find(
    (rate) => rate?.DappName === rates?.DappName,
  );
  let maxAmountOut, erc20Fee, expectAmount, protocol, dAppAddress;
  if (bestRate) {
    try {
      maxAmountOut = BigNumber(
        bestRate?.MaxAmountOut || rates?.MaxAmountOut || 0,
      )
        .dividedToIntegerBy(1)
        .toNumber();
      expectAmount = bestRate?.RatioTrade || rates?.RatioTrade;
      erc20Fee = BigNumber(bestRate?.PrvFee || rates?.PrvFee || 0)
        .dividedToIntegerBy(1)
        .toNumber();
      protocol = bestRate?.DappName || rates?.DappName;
      dAppAddress = bestRate?.DappAddress || rates?.DappAddress;
    } catch (e) {
      console.debug('ERROR', e);
    }
  }
  const data = {
    maxAmountOut,
    erc20Fee,
    expectAmount,
    protocol,
    dAppAddress,
    network: TRADING.ERC20_NETWORK[protocol] || TRADING.ERC20_NETWORK['PDex'],
    crossTrade:
      TRADING.ERC20_NETWORK[protocol] === TRADING.ERC20_NETWORK['PDex'],
  };
  return data;
};

export const apiTradePKyber = (data) => http.post('/uniswap/execute', data);
