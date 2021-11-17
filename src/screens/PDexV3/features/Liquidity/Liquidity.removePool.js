import React, {memo} from 'react';
import {RefreshControl, ScrollView, Text, View} from 'react-native';
import PropTypes from 'prop-types';
import {styled as mainStyle} from '@screens/PDexV3/PDexV3.styled';
import {Header, Row, SuccessModal} from '@src/components';
import {
  formConfigsRemovePool,
  LIQUIDITY_MESSAGES,
  SUCCESS_MODAL
} from '@screens/PDexV3/features/Liquidity/Liquidity.constant';
import withLiquidity from '@screens/PDexV3/features/Liquidity/Liquidity.enhance';
import {createForm, RFTradeInputAmount as TradeInputAmount, validator} from '@components/core/reduxForm';
import styled from '@screens/PDexV3/features/Liquidity/Liquidity.styled';
import {Field} from 'redux-form';
import {AddBreakLine} from '@components/core';
import {batch, useDispatch, useSelector} from 'react-redux';
import {liquidityActions, removePoolSelector} from '@screens/PDexV3/features/Liquidity/index';
import {ButtonTrade} from '@components/Button';
import SelectPercentAmount from '@components/SelectPercentAmount';
import {COLORS} from '@src/styles';
import {compose} from 'recompose';
import withTransaction from '@screens/PDexV3/features/Liquidity/Liquidity.enhanceTransaction';
import LPHistoryIcon from '@screens/PDexV3/features/Liquidity/Liquidity.iconHistory';
import {MaxIcon} from '@components/Icons';
import {useNavigation} from 'react-navigation-hooks';

const initialFormValues = {
  inputToken: '',
  outputToken: '',
};

const Form = createForm(formConfigsRemovePool.formName, {
  initialValues: initialFormValues,
  destroyOnUnmount: true,
  enableReinitialize: true,
});

const InputsGroup = () => {
  const dispatch = useDispatch();
  const [percent, setPercent] = React.useState(0);
  const inputAmount = useSelector(removePoolSelector.inputAmountSelector);
  const inputToken = inputAmount(formConfigsRemovePool.formName, formConfigsRemovePool.inputToken);
  const outputToken = inputAmount(formConfigsRemovePool.formName, formConfigsRemovePool.outputToken);
  const { maxInputShareStr, maxOutputShareStr } = useSelector(removePoolSelector.maxShareAmountSelector) || {};
  const onChangeInput = (text) => dispatch(liquidityActions.actionChangeInputRemovePool(text));
  const onChangeOutput = (text) => dispatch(liquidityActions.actionChangeOutputRemovePool(text));
  const onMaxPress = () => dispatch(liquidityActions.actionMaxRemovePool());
  const onChangePercent = (_percent) => {
    setPercent(_percent);
    if (_percent === 100) {
      return onMaxPress();
    }
    dispatch(liquidityActions.actionChangePercentRemovePool(_percent));
  };
  const _validateInput = React.useCallback(() => {
    return inputToken.error;
  }, [inputToken.error]);
  const _validateOutput = React.useCallback(() => {
    return outputToken.error;
  }, [outputToken.error]);
  return (
    <>
      <View style={styled.inputBox}>
        <Field
          component={TradeInputAmount}
          name={formConfigsRemovePool.inputToken}
          validate={[
            _validateInput,
            ...validator.combinedAmount,
          ]}
          visibleHeader
          editableInput={!inputToken.loadingBalance}
          srcIcon={inputToken && inputToken?.iconUrl}
          symbol={inputToken && inputToken?.symbol}
          onChange={onChangeInput}
          onPressInfinityIcon={onMaxPress}
          label="Amount"
          hasInfinityIcon
        />
        <AddBreakLine />
        <Field
          component={TradeInputAmount}
          name={formConfigsRemovePool.outputToken}
          validate={[
            _validateOutput,
            ...validator.combinedAmount,
          ]}
          label="Amount"
          symbol={outputToken && outputToken?.symbol}
          srcIcon={outputToken && outputToken?.iconUrl}
          editableInput={!outputToken.loadingBalance}
          onChange={onChangeOutput}
          onPressInfinityIcon={onMaxPress}
          visibleHeader
          hasInfinityIcon
        />
      </View>
    </>
  );
};

const RemoveLPButton = React.memo(({ onSubmit }) => {
  const { disabled } = useSelector(removePoolSelector.disableRemovePool);
  const amountSelector = useSelector(removePoolSelector.inputAmountSelector);
  const { feeAmount } = useSelector(removePoolSelector.feeAmountSelector);
  const poolId = useSelector(removePoolSelector.poolIDSelector);
  const nftId = useSelector(removePoolSelector.nftTokenSelector);
  const inputAmount = amountSelector(formConfigsRemovePool.formName, formConfigsRemovePool.inputToken);
  const outputAmount = amountSelector(formConfigsRemovePool.formName, formConfigsRemovePool.outputToken);
  const handleSubmit = () => {
    if (disabled) return;
    const params = {
      fee: feeAmount,
      poolTokenIDs: [inputAmount.tokenId, outputAmount.tokenId],
      poolPairID: poolId,
      shareAmount: inputAmount.withdraw,
      nftID: nftId,
      amount1: String(inputAmount.originalInputAmount),
      amount2: String(outputAmount.originalInputAmount)
    };
    onSubmit(params);
  };

  return (
    <ButtonTrade
      btnStyle={mainStyle.button}
      title={LIQUIDITY_MESSAGES.removePool}
      disabled={disabled}
      onPress={handleSubmit}
    />
  );
});

const RemovePool = ({
  onInitRemovePool,
  onRemoveContribute,
  onCloseModal,
  visible,
  error,
}) => {
  const navigation = useNavigation();
  const isFetching = useSelector(removePoolSelector.isFetchingSelector);
  const onSubmit = (params) => {
    typeof onRemoveContribute === 'function' && onRemoveContribute(params);
  };
  const onClose = () => {
    batch(() => {
      onCloseModal();
      onInitRemovePool();
      navigation.goBack();
    });
  };

  const renderContent = () => (
    <>
      <InputsGroup />
      <View style={styled.padding}>
        {!!error && <Text style={styled.warning}>{error}</Text>}
        <RemoveLPButton onSubmit={onSubmit} />
      </View>
    </>
  );

  React.useEffect(() => { onInitRemovePool(); }, []);
  return (
    <>
      <View style={styled.container}>
        <Header style={styled.padding} title={LIQUIDITY_MESSAGES.removePool} />
        <ScrollView
          refreshControl={(<RefreshControl refreshing={isFetching} onRefresh={onInitRemovePool} />)}
          showsVerticalScrollIndicator={false}
        >
          <Form>
            {renderContent()}
          </Form>
        </ScrollView>
      </View>
      <SuccessModal
        closeSuccessDialog={onClose}
        title={SUCCESS_MODAL.REMOVE_POOL.title}
        buttonTitle="Back to dashboard"
        extraInfo={SUCCESS_MODAL.REMOVE_POOL.desc}
        visible={visible}
      />
    </>
  );
};

RemovePool.defaultProps = {
  error: ''
};

RemovePool.propTypes = {
  onInitRemovePool: PropTypes.func.isRequired,
  onRemoveContribute: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  error: PropTypes.string
};

RemoveLPButton.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default compose(
  withLiquidity,
  withTransaction,
)(memo(RemovePool));
