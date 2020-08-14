class TokenModel {
  static fromJson = (data = {}) => ({
    amount: 0,
    totalSupply: data.Amount,
    id: data.ID,
    isPrivacy: data.IsPrivacy,
    name: data.Name,
    symbol: data.Symbol,
    isInit: data.isInit,
    listTxs: data.ListTxs,
  });

  static toJson = (data = {}) => ({
    Amount: data.totalSupply,
    ID: data.id,
    IsPrivacy: data.isPrivacy,
    Name: data.name,
    Symbol: data.symbol,
    isInit: data.isInit,
    ListTxs: data.listTxs,
  });
}

export default TokenModel;