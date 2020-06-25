import React, {useState} from 'react';
import _ from 'lodash';
import { useNavigationParam } from 'react-navigation-hooks';
import { calculateInputValue } from '@screens/DexV2/components/Trade/utils';
import { MAX_DEX_FEE } from '@components/EstimateFee/EstimateFee.utils';
import convert from '@utils/convert';
import { MIN_PERCENT } from '@screens/DexV2/constants';

const withParams = WrappedComp => (props) => {
  const [filled, setFilled] = useState(false);
  const inputTokenId = useNavigationParam('inputTokenId');
  const outputTokenId = useNavigationParam('outputTokenId');
  const outputValue = useNavigationParam('outputValue');

  const { pair, inputBalance, inputText } = props;


  React.useEffect(() => {
    if (filled || _.isEmpty(pair) || inputBalance === null) {
      return;
    }

    const { pairTokens } = props;
    const {
      onChangeInputToken,
      onChangeOutputToken,
      onChangeInputText,
    } = props;

    if (inputTokenId || outputTokenId) {
      const inputToken = pairTokens.find(token => token.id === inputTokenId);
      const outputToken = pairTokens.find(token => token.id === outputTokenId);

      if (inputToken) {
        onChangeInputToken(inputToken);
      }

      if (outputToken) {
        onChangeOutputToken(outputToken);
      }

      if (!inputText) {
        return;
      }

      if (outputValue) {
        const minimumAmount = _.floor(outputValue / MIN_PERCENT);
        const inputValue = calculateInputValue(pair, inputToken, minimumAmount, outputToken);
        const inputText = convert.toHumanAmount(inputValue + (MAX_DEX_FEE), inputToken.pDecimals);
        onChangeInputText(inputText.toString());
      }
    }

    setFilled(true);
  }, [pair, inputBalance, inputText, inputTokenId, outputTokenId]);

  return (
    <WrappedComp
      {...{
        ...props,
      }}
    />
  );
};

export default withParams;
