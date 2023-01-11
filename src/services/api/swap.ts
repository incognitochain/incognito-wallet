import http4 from '@src/services/http4';
import createLogger from '@utils/logger';

const logger = createLogger('API');

type GetEstimateTradingFeePayload = {
  amount: string;
  fromToken: string;
  network?: string;
  slippage: string;
  toToken: string;
  shardID: string;
};

/**
 * Get Estiamte Trading Fee
 * @amount {string}
 * @fromToken {string}
 * @network {string}
 * @slippage {string}
 * @toToken {string}
 */

const getEstimateTradingFee = async (payload: GetEstimateTradingFeePayload) => {
  try {
    const params = {
      ...payload,
      network: payload.network ?? 'inc', // Default network = inc
    };
    logger('[getEstimateTradingFee]  params ', params);
    const data: any = await http4.post('papps/estimateswapfee', params);
    logger('[getEstimateTradingFee]  response ', data);
    const exchangeSupports = data?.Networks;
    return exchangeSupports;
  } catch (error) {
    // logger('[getEstimateTradingFee]  error ', {
    //   error,
    // });
    throw error;
  }
};

type DexSwapMonitorPayload = {
  txhash: string;
  token_sell: string;
  token_buy: string;
  amount_in: string;
  amount_out: string;
};

const dexSwapMonitor = async (payload: DexSwapMonitorPayload) => {
  try {
    const params = {
      ...payload,
    };
    logger('[dexSwapMonitor]  params ', params);
    const data: any = await http4.post('dexswap', params);
    logger('[dexSwapMonitor]  response ', data);
    return data;
  } catch (error) {
    logger('[dexSwapMonitor]  error ', {
      error,
    });
    throw error;
  }
};

const SwapService = {
  getEstimateTradingFee,
  dexSwapMonitor,
};

export default SwapService;
