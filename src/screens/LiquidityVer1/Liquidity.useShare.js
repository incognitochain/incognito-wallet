import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { actionGetPDexV3Inst } from '@screens/PDexV3';
import { combineData } from '@screens/LiquidityVer1/Liquiditity.utils';

const useShare = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState({
    share: { feePairs: [], userPairs: [] },
    loading: false
  });

  const getListShare = async () => {
    try {
      if (data.loading) return;
      setData(item => ({ ...item, loading: true }));
      const pDexV3Inst = await dispatch(actionGetPDexV3Inst());
      const share = await pDexV3Inst.getPairs();
      console.log('SANG TEST:: ', share);
      // combineData({ feePairs, userPairs });
      // share: { feePairs, userPairs },
      setData({ loading: false });
    } catch (e) {
      console.log(e);
      setData(item => ({ ...item, loading: false }));
    }
  };

  React.useEffect(() => {
    getListShare().then();
  }, []);

  return { share: data.share, loading: data.loading };
};

export default useShare;