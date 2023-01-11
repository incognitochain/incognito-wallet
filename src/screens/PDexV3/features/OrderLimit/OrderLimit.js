import React from 'react';
import PropTypes from 'prop-types';
import { KeyboardAwareScrollView, RefreshControl } from '@src/components/core';
import { createForm } from '@src/components/core/reduxForm';
import { ButtonBasic } from '@src/components/Button';
import LoadingTx from '@src/components/LoadingTx';
import useDebounceSelector from '@src/shared/hooks/debounceSelector';
import GroupSubInfo from './OrderLimit.groupSubInfo';
import { formConfigs } from './OrderLimit.constant';
import { styled } from './OrderLimit.styled';
import { orderLimitDataSelector } from './OrderLimit.selector';
import withOrderLimit from './OrderLimit.enhance';
import OrderLimitInputsGroup from './OrderLimit.inputsGroup';
import OrderDetails from './OrderLimit.details';
// import {
//   feeDataSelector,
//   validatePRVNetworkFee,
// } from '@src/components/EstimateFee/EstimateFee.selector';

const initialFormValues = {
  selltoken: '',
  buytoken: '',
  feetoken: '',
  rate: '',
};

const Form = createForm(formConfigs.formName, {
  initialValues: initialFormValues,
  destroyOnUnmount: true,
  enableReinitialize: true,
});

const OrderLimit = (props) => {
  const { mainColor, btnActionTitle, ordering, calculating } =
    useDebounceSelector(orderLimitDataSelector);
  const { handleConfirm, onRefresh } = props;
  React.useEffect(() => {
    onRefresh();
  }, []);
  return (
    <>
      <KeyboardAwareScrollView
        style={styled.container}
        refreshControl={
          <RefreshControl refreshing={calculating} onRefresh={onRefresh} />
        }
      >
        <Form>{() => <OrderLimitInputsGroup />}</Form>
        <OrderDetails />
        <ButtonBasic
          btnStyle={{
            backgroundColor: mainColor,
            borderRadius: 8,
            marginTop: 24,
            marginBottom: 16,
          }}
          title={btnActionTitle}
          onPress={handleConfirm}
        />
        <GroupSubInfo />
      </KeyboardAwareScrollView>
      {!!ordering && <LoadingTx />}
    </>
  );
};

OrderLimit.propTypes = {
  tabsFactories: PropTypes.array.isRequired,
  handleConfirm: PropTypes.func.isRequired,
  callback: PropTypes.func.isRequired,
};

export default withOrderLimit(React.memo(OrderLimit));
