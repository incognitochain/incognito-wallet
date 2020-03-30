class UniswapRequest {
  constructor(json) {
    if (!json) {
      return {};
    }

    this.id = json.ID;
    this.status = json.Status;
    this.txId = json.EthereumTx;
  }
}

export default UniswapRequest;
