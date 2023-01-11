import React from 'react';
import { View } from 'react-native';
import { ReviewOrder, TradeSuccessModal } from '@screens/PDexV3/features/Trade';
import { useDispatch, useSelector } from 'react-redux';
import { actionToggleModal } from '@src/components/Modal';
import { Hook, styled as extraStyled } from '@screens/PDexV3/features/Extra';
import { Text } from '@src/components/core';
import { actionFetchSwap } from './Swap.actions';
import { swapInfoSelector } from './Swap.selector';
import { useTabFactories } from './Swap.simpleTab';

const Review = () => {
  const dispatch = useDispatch();
  const swapInfo = useSelector(swapInfoSelector);
  const { hooksFactories: factories } = useTabFactories();
  const hooksFactories = [
    {
      label: 'Pay with',
      value: swapInfo?.sellInputAmountStr || '',
      boldLabel: true,
      boldValue: true,
    },
    ...factories,
  ];
  const handleConfirm = async () => {
    try {
      const tx = await dispatch(actionFetchSwap());
      if (tx) {
        dispatch(
          actionToggleModal({
            data: (
              <TradeSuccessModal
                desc={`You placed an order to sell 
                ${swapInfo?.sellInputAmountStr ||
                  ''} for ${swapInfo?.buyInputAmountStr || ''}.`}
              />
            ),
            visible: true,
          }),
        );
      }
    } catch {
      //
    }
  };

  return (
    <ReviewOrder
      extra={(
        <View>
          <Text style={extraStyled.specialTitle}>
            Buy at least {swapInfo?.buyInputAmountStr || ''}
          </Text>
          {hooksFactories.map((hook) => (
            <Hook key={hook.label} {...hook} />
          ))}
        </View>
      )}
      handleConfirm={handleConfirm}
    />
  );
};

Review.propTypes = {};

export default React.memo(Review);
