import React from 'react';
import {useNavigation, useNavigationParam} from 'react-navigation-hooks';
import TradeSuccessModal from '@screens/DexV2/components/TradeSuccessModal';

const withSuccess = WrappedComp => (props) => {
  // when trade success reload rate
  const onTradeSuccess  = useNavigationParam('onTradeSuccess');

  const [tradeSuccess, setTradeSuccess] = React.useState(false);
  const navigation = useNavigation();

  const {
    inputText,
    inputToken,
    outputToken,
    minimumAmount,
  } = props;

  const closeSuccess = () => {
    setTradeSuccess(false);
    onTradeSuccess && onTradeSuccess();
    navigation.goBack();
  };

  return (
    <>
      <WrappedComp
        {...{
          ...props,
          onTradeSuccess: setTradeSuccess,
        }}
      />
      <TradeSuccessModal
        closeSuccessDialog={closeSuccess}
        inputToken={inputToken}
        inputValue={inputText}
        outputToken={outputToken}
        outputValue={minimumAmount}
        visible={tradeSuccess}
      />
    </>
  );
};

export default withSuccess;
