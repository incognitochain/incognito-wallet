import React, { useEffect } from 'react';
import { ExHandler } from '@services/exception';
import { provide } from '@services/api/pool';
import LocalDatabase from '@utils/LocalDatabase';
import apiCode from '@services/exception/customError/code/apiCode';

const withRetry = WrappedComp => (props) => {
  const {
    onReloadHistories,
    onLoad,
    account,
  } = props;

  const retryCallAPI = async (tx, txs) => {
    const txIndex = txs.indexOf(tx);
    try {
      await provide(tx.paymentAddress, tx.txId, tx.signPublicKeyEncode, tx.value);
      txs.splice(txIndex, 1);
    } catch (e) {
      if (e.code === apiCode.api_tx_added ||
          e.code === apiCode.api_amount_invalid) {
        txs.splice(txIndex, 1);
      }
    }
  };

  const retryProvideTxs = async () => {
    const txs = await LocalDatabase.getProvideTxs();
    if (txs && txs.length > 0) {
      await Promise.all(txs.map(tx => retryCallAPI(tx, txs)));
      await LocalDatabase.saveProvideTxs(txs);
      await onReloadHistories();
      await onLoad(account);
    }
  };

  useEffect(() => {
    retryProvideTxs();
  }, []);

  return (
    <WrappedComp
      {...{
        ...props,
      }}
    />
  );
};

export default withRetry;
