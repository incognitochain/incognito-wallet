import { CONSTANT_COMMONS } from '@src/constants';
import TokenModel from './token';

class PToken {
  constructor(data = {}, pTokens = []) {
    const pairPrv = data?.CurrentPrvPool !== 0;
    this.id = data.ID;
    this.address = data.ContractID;
    this.createdAt = data.CreatedAt;
    this.updatedAt = data.UpdatedAt;
    this.deletedAt = data.DeletedAt;
    this.tokenId = data.TokenID;
    this.symbol = data.Symbol;
    this.name = data.Name;
    this.contractId = data.ContractID;
    this.decimals = data.Decimals;
    this.pDecimals = data.PDecimals;
    this.type = data.Type; // coin or token
    this.pSymbol = data.PSymbol;
    this.default = data.Default;
    this.userId = data.UserID;
    this.verified = data.Verified;
    this.currencyType = data.CurrencyType; // including ERC20, BEP1, BEP2,...
    this.priceUsd = data?.PriceUsd;
    this.externalPriceUSD = data?.ExternalPriceUSD; // current market price
    this.pairPrv = pairPrv;
    this.change = data?.PercentChange24h || '';
    this.pricePrv = data?.PricePrv || 0;
    this.defaultPoolPair = data?.DefaultPoolPair;
    this.defaultPairToken = data?.DefaultPairToken;
    this.network = data?.Network;
    this.networkId = data?.NetworkID;
    this.image = data?.Image;
    this.movedUnifiedToken = data?.MovedUnifiedToken;
    this.listUnifiedToken = data?.ListUnifiedToken;
    this.parentUnifiedID = data?.ParentUnifiedID;
    this.isPUnifiedToken = this.currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.UNIFIED_TOKEN;
    const tokens =
      pTokens &&
      pTokens.filter(
        (_token) => _token.Symbol && _token.Symbol === data.Symbol,
      );
    this.hasSameSymbol = tokens && tokens.length > 1;
    if (data && data.ListChildToken instanceof Array) {
      this.listChildToken = data.ListChildToken.map((item) => {
        let newItem = new PToken(item);
        newItem.parentID = item.ParentID;
        return newItem;
      });
    } else {
      this.listChildToken = [];
    }
    if (data && data.ListUnifiedToken instanceof Array) {
      this.listUnifiedToken = data.ListUnifiedToken.map((item) => {
        let newItem = new PToken(item);
        newItem.parentID = item.ParentID;
        return newItem;
      });
    } else {
      this.listUnifiedToken = [];
    }
  }

  /**
   * Convert to data structure of token which stored in wallet object
   */
  convertToToken() {
    return TokenModel.toJson({
      id: this.tokenId,
      isPrivacy: true,
      name: this.name,
      symbol: this.pSymbol,
      isInit: false,
      // listTxs,
      // image,
      // amount
    });
  }
}

export default PToken;
