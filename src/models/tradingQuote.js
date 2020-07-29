import { MIN_PERCENT } from '@screens/DexV2/constants';
import BigNumber from 'bignumber.js';

class TradingQuote {
  constructor(json) {
    if (!json) {
      return {};
    }

    this.price = json.price;
    this.amount = json.amount;
    this.maxPrice = json.maxPrice;
    this.minimumAmount = json.minimumAmount;
    this.expectedRate = new BigNumber(json.expectedRate)
      .multipliedBy(MIN_PERCENT)
    ;
    this.to = json.to;
    this.data = json.data;
  }
}

export default TradingQuote;
