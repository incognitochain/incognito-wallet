import { MAX_PDEX_TRADE_STEPS } from '@screens/DexV2/constants';

export const DEFAULT_FEE_PER_KB_HUMAN_AMOUNT = 0.00000001; // in nano
export const DEFAULT_FEE_PER_KB = DEFAULT_FEE_PER_KB_HUMAN_AMOUNT * 1e9; // in nano
export const MAX_TX_SIZE = 100;
export const MAX_FEE_PER_TX = DEFAULT_FEE_PER_KB * MAX_TX_SIZE;
export const MAX_DEX_FEE = MAX_FEE_PER_TX * MAX_PDEX_TRADE_STEPS;
export const DEFI_TRADING_FEE = 1000000;
