class TradingQuote {
  constructor(json) {
    if (!json) {
      return {};
    }

    this.price = json.price;
    this.amount = json.amount;
  }
}

export default TradingQuote;
