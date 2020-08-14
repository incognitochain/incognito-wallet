import { MESSAGES } from '@screens/Dex/constants';

import TradeHistory from './TradeHistory';
import DepositHistory from './DepositHistory';
import WithdrawHistory from './WithdrawHistory';
import AddLiquidityHistory from './AddLiquidity';
import RemoveLiquidityHistory from './RemoveLiquidity';

const HISTORY_COMPONENTS = {
  [MESSAGES.DEPOSIT]: DepositHistory,
  [MESSAGES.WITHDRAW]: WithdrawHistory,
  [MESSAGES.TRADE]: TradeHistory,
  [MESSAGES.ADD_LIQUIDITY]: AddLiquidityHistory,
  [MESSAGES.REMOVE_LIQUIDITY]: RemoveLiquidityHistory,
};

export default HISTORY_COMPONENTS;
