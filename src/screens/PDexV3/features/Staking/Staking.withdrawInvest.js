import React from 'react';
import {ScrollView, View} from 'react-native';
import PropTypes from 'prop-types';
import {styled as mainStyle} from '@screens/PDexV3/PDexV3.styled';
import {Header, Row, RowSpaceText} from '@src/components';
import {
  formConfigsWithdrawInvest,
  STAKING_MESSAGES
} from '@screens/PDexV3/features/Staking/Staking.constant';
import {createForm, RFTradeInputAmount as TradeInputAmount, validator} from '@components/core/reduxForm';
import {coinStyles as coinStyled} from '@screens/PDexV3/features/Staking/Staking.styled';
import {useDispatch, useSelector} from 'react-redux';
import {Text} from '@components/core';
import {change, Field} from 'redux-form';
import withInput from '@screens/PDexV3/features/Staking/Staking.enhanceInput';
import {stakingSelector} from '@screens/PDexV3/features/Staking/index';
import {BTNPrimary} from '@components/core/Button';
import isEmpty from 'lodash/isEmpty';
import withTransaction from '@screens/PDexV3/features/Staking/Staking.transaction';

const initialFormValues = {
  input: ''
};

const Form = createForm(formConfigsWithdrawInvest.formName, {
  initialValues: initialFormValues,
  destroyOnUnmount: true,
  enableReinitialize: true,
});

const Input = React.memo(({ onWithdrawMaxInvest }) => {
  const dispatch = useDispatch();
  const inputValidate = useSelector(stakingSelector.withdrawInvestValidate);
  const { withdrawInvest, token } = useSelector(stakingSelector.withdrawInvestCoinSelector);

  const onChangeText = (text) => dispatch(change(formConfigsWithdrawInvest.formName, formConfigsWithdrawInvest.input, text));
  const onChangeWithdrawMax = () => withdrawInvest && onWithdrawMaxInvest(withdrawInvest.maxWithdrawAmountStr);
  return(
    <>
      <Field
        component={TradeInputAmount}
        name={formConfigsWithdrawInvest.input}
        visibleHeader
        validate={[
          ...validator.combinedAmount,
          inputValidate,
        ]}
        onChange={onChangeText}
        editableInput
        onPressInfinityIcon={onChangeWithdrawMax}
        wrapInputStyle={coinStyled.wrapInput}
        inputStyle={coinStyled.input}
        symbolStyle={coinStyled.symbol}
        infiniteStyle={coinStyled.infinite}
        symbol={token?.symbol}
        srcIcon={token.iconUrl}
        canSelectSymbol={false}
        hasInfinityIcon
      />
    </>
  );
});

const CustomInput = withInput(Input);

const StakingWithdrawInvest = React.memo(({ onUnStaking, error }) => {
  const disabled = useSelector(stakingSelector.withdrawInvestDisable);
  const withdrawCoins = useSelector(stakingSelector.withdrawCoinsSelector);
  const onSubmit = () => {
    if (isEmpty(withdrawCoins)) return;
    typeof onUnStaking === 'function' && onUnStaking(withdrawCoins);
  };
  return (
    <View style={mainStyle.container}>
      <Header title={STAKING_MESSAGES.withdraw} />
      <View style={coinStyled.coinContainer}>
        <ScrollView>
          <>
            <Form>
              {() => (<CustomInput />)}
            </Form>
            {!!error && (<Text style={coinStyled.error}>{error}</Text>)}
            <BTNPrimary
              title={STAKING_MESSAGES.withdraw}
              wrapperStyle={coinStyled.button}
              disabled={disabled || error}
              onPress={onSubmit}
            />
          </>
        </ScrollView>
      </View>
    </View>
  );
});

Input.propTypes = {
  onWithdrawMaxInvest: PropTypes.func.isRequired
};

StakingWithdrawInvest.defaultProps = {
  error: undefined
};

StakingWithdrawInvest.protoTypes = {
  onUnStaking: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default withTransaction(StakingWithdrawInvest);
