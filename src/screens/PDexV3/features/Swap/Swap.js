import { ButtonTrade } from '@src/components/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { createForm } from '@components/core/reduxForm';
import { useSelector } from 'react-redux';
import LoadingTx from '@src/components/LoadingTx';
import { 
  KeyboardAwareScrollView, 
  RefreshControl,
  View,
} from '@src/components/core';
import globalStyled from '@src/theme/theme.styled';
import { styled } from './Swap.styled';
import { formConfigs } from './Swap.constant';
import withSwap from './Swap.enhance';
import { swapInfoSelector } from './Swap.selector';
import SwapInputsGroup from './Swap.inputsGroup';
import GroupSubInfo from './Swap.groupSubInfo';

const initialFormValues = {
  selltoken: '',
  buytoken: '',
  slippagetolerance: '',
  feetoken: '',
};

const Form = createForm(formConfigs.formName, {
  initialValues: initialFormValues,
  destroyOnUnmount: true,
  enableReinitialize: true,
});

const Swap = (props) => {
  const { initSwapForm, handleConfirm } = props;
  const swapInfo = useSelector(swapInfoSelector);
  return (
    <>
      <KeyboardAwareScrollView
        style={[styled.scrollview, globalStyled.defaultPadding3]}
        refreshControl={
          <RefreshControl
            refreshing={swapInfo?.refreshing}
            onRefresh={initSwapForm}
          />
        }
      >
        <Form>
          {() => (
            <>
              <SwapInputsGroup />
              <ButtonTrade
                btnStyle={styled.btnTrade}
                onPress={handleConfirm}
                title={swapInfo?.btnSwapText || ''}
              />
            </>
          )}
        </Form>
        <GroupSubInfo />
      </KeyboardAwareScrollView>
      {!!swapInfo.swaping && <LoadingTx />}
    </>
  );
};

Swap.propTypes = {
  handleConfirm: PropTypes.func.isRequired,
};

export default withSwap(React.memo(Swap));
