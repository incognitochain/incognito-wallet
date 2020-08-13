import React from 'react';
import { useSelector } from 'react-redux';
import debounce from 'lodash/debounce';
import { validator } from '@src/components/core/reduxForm';
import convert from '@src/utils/convert';
import { feeDataSelector } from '@src/components/EstimateFee/EstimateFee.selector';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import { detectToken } from '@src/utils/misc';

export const enhanceAmountValidation = (WrappedComp) => (props) => {
  const feeData = useSelector(feeDataSelector);
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const { fee, feeUnitByTokenId, minAmount, maxAmount } = feeData;
  const initialState = {
    maxAmountValidator: undefined,
    minAmountValidator: undefined,
  };
  const [state, setState] = React.useState({ ...initialState });
  const { maxAmountValidator, minAmountValidator } = state;
  const setFormValidator = debounce(async () => {
    const { maxAmountText, minAmountText } = feeData;
    const _maxAmount = convert.toNumber(maxAmountText, true);
    const _minAmount = convert.toNumber(minAmountText, true);
    let currentState = { ...state };
    if (Number.isFinite(_maxAmount)) {
      currentState = {
        ...state,
        maxAmountValidator: validator.maxValue(_maxAmount, {
          message:
            _maxAmount > 0
              ? `Max amount you can withdraw is ${maxAmountText} ${selectedPrivacy?.externalSymbol ||
                  selectedPrivacy?.symbol}`
              : 'Your balance is insufficient.',
        }),
      };
      await setState(currentState);
    }
    if (Number.isFinite(_minAmount)) {
      await setState({
        ...currentState,
        minAmountValidator: validator.minValue(_minAmount, {
          message: `Amount must be larger than ${minAmountText} ${selectedPrivacy?.externalSymbol ||
            selectedPrivacy?.symbol}`,
        }),
      });
    }
  }, 200);

  const getAmountValidator = () => {
    const val = [];
    val.push(...validator.combinedAmount);
    if (minAmountValidator) val.push(minAmountValidator);
    if (maxAmountValidator) val.push(maxAmountValidator);
    if (
      selectedPrivacy?.isIncognitoToken ||
      detectToken.ispNEO(selectedPrivacy?.tokenId)
    ) {
      val.push(...validator.combinedNanoAmount);
    }
    const values = Array.isArray(val) ? [...val] : [val];
    return values;
  };

  React.useEffect(() => {
    setFormValidator();
  }, [selectedPrivacy?.tokenId, fee, feeUnitByTokenId, maxAmount, minAmount]);

  const validateAmount = getAmountValidator();

  return (
    <WrappedComp
      {...{
        ...props,
        validateAmount,
        minAmountValidator,
        maxAmountValidator,
      }}
    />
  );
};
