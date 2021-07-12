import React from 'react';
import { useSelector } from 'react-redux';
import debounce from 'lodash/debounce';
import { validator } from '@src/components/core/reduxForm';
import { selectedPrivacySelector } from '@src/redux/selectors';
import { detectToken } from '@src/utils/misc';

export const enhancePortalValidation = (WrappedComp) => (props) => {
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const { portalData } = props;
  const { 
    minUnshieldAmount,
    maxUnshieldAmount,
  } = portalData;

  const initialState = {
    maxAmountValidator: undefined,
    minAmountValidator: undefined,
  };
  const [state, setState] = React.useState({ ...initialState });
  const { maxAmountValidator, minAmountValidator } = state;
  const setFormValidator = debounce(async () => {
    let currentState = { ...state };
    if (Number.isFinite(maxUnshieldAmount)) {
      currentState = {
        ...state,
        maxAmountValidator: validator.maxValue(maxUnshieldAmount, {
          message:
          maxUnshieldAmount > 0
            ? `Max amount you can withdraw is ${maxUnshieldAmount} ${selectedPrivacy?.externalSymbol ||
                  selectedPrivacy?.symbol}`
            : 'Your balance is insufficient.',
        }),
      };
      await setState(currentState);
    }
    if (Number.isFinite(minUnshieldAmount)) {
      await setState({
        ...currentState,
        minAmountValidator: validator.minValue(minUnshieldAmount, {
          message: `Amount must be larger than ${minUnshieldAmount} ${selectedPrivacy?.externalSymbol ||
            selectedPrivacy?.symbol}`,
        }),
      });
    }
  }, 200);

  const getAmountValidator = () => {
    const val = [];
    if (minAmountValidator) val.push(minAmountValidator);
    if (maxAmountValidator) val.push(maxAmountValidator);
    if (
      selectedPrivacy?.isIncognitoToken ||
      detectToken.ispNEO(selectedPrivacy?.tokenId)
    ) {
      val.push(...validator.combinedNanoAmount);
    }
    val.push(...validator.combinedAmount);
    const values = Array.isArray(val) ? [...val] : [val];
    return values;
  };

  React.useEffect(() => {
    setFormValidator();
  }, [selectedPrivacy?.tokenId, maxUnshieldAmount, minUnshieldAmount]);

  const validatePortalAmount = getAmountValidator();

  const validateUnshieldPortalCondition = validator.equal('true', { message: 'Required' });

  return (
    <WrappedComp
      {...{
        ...props,
        validatePortalAmount,
        minAmountValidator,
        maxAmountValidator,
        validateUnshieldPortalCondition,
      }}
    />
  );
};
