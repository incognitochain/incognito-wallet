import { ButtonTrade } from '@src/components/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { createForm } from '@components/core/reduxForm';
import { useSelector } from 'react-redux';
import LoadingTx from '@src/components/LoadingTx';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { KeyboardAwareScrollView, RefreshControl } from '@src/components/core';
import { NetworkFee } from '@screens/PDexV3/features/Share';
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
  const navigation = useNavigation();
  const handleNavOrderHistory = () =>
    navigation.navigate(routeNames.TradeOrderHistory);
  const swapInfo = useSelector(swapInfoSelector);
  return (
    <>
      <KeyboardAwareScrollView
        style={styled.scrollview}
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
                disabled={!!swapInfo?.disabledBtnSwap}
              />
              <NetworkFee />
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
