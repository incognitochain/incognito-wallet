import { MESSAGES } from '@screens/Uniswap/constants';

import TradeHistory from './TradeHistory';
import DepositHistory from './DepositHistory';
import WithdrawHistory from './WithdrawHistory';
import WithdrawSC from './WithdrawSC';

const HISTORY_COMPONENTS = {
  [MESSAGES.DEPOSIT]: DepositHistory,
  [MESSAGES.WITHDRAW]: WithdrawHistory,
  [MESSAGES.TRADE]: TradeHistory,
  [MESSAGES.WITHDRAW_SC]: WithdrawSC,
};

export default HISTORY_COMPONENTS;
