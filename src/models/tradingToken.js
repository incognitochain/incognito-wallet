import TRADING from '@src/constants/trading';

class TradingToken {
  constructor(json) {
    if (!json) {
      return {};
    }

    this.id = json.id;
    this.name = json.name;
    this.symbol = json.symbol;
    this.address = json.address;
    this.decimals = json.decimals;
    this.pDecimals = json.pDecimals;
    this.protocol = json.protocol;
  }

  is0x() {
    return this.protocol === TRADING.PROTOCOLS.OX;
  }

  isKyber() {
    return this.protocol === TRADING.PROTOCOLS.KYBER;
  }
}

export default TradingToken;
