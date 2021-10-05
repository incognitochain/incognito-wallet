import React, {memo} from 'react';
import {RefreshControl, ScrollView, View} from 'react-native';
import PropTypes from 'prop-types';
import {styled as mainStyle} from '@screens/PDexV3/PDexV3.styled';
import {Header, RowSpaceText, SuccessModal} from '@src/components';
import {
  LIQUIDITY_MESSAGES,
  formConfigsContribute,
  SUCCESS_MODAL
} from '@screens/PDexV3/features/Liquidity/Liquidity.constant';
import {createForm, RFTradeInputAmount as TradeInputAmount, validator} from '@components/core/reduxForm';
import {useDispatch, useSelector} from 'react-redux';
import styled from '@screens/PDexV3/features/Liquidity/Liquidity.styled';
import {Field} from 'redux-form';
import {AddBreakLine} from '@components/core';
import withLiquidity from '@screens/PDexV3/features/Liquidity/Liquidity.enhance';
import {contributeSelector, liquidityActions} from '@screens/PDexV3/features/Liquidity';
import {ButtonTrade} from '@components/Button';
import {NFTTokenBottomBar} from '@screens/PDexV3/features/NFTToken';
import {compose} from 'recompose';
import withTransaction from '@screens/PDexV3/features/Liquidity/Liquidity.enhanceTransaction';

const initialFormValues = {
  inputToken: '',
  outputToken: '',
};

const Form = createForm(formConfigsContribute.formName, {
  initialValues: initialFormValues,
  destroyOnUnmount: true,
  enableReinitialize: true,
});

const InputsGroup = () => {
  const dispatch = useDispatch();
  const { inputToken, outputToken } = useSelector(contributeSelector.mappingDataSelector);
  const onChangeInput = (newText) => dispatch(liquidityActions.actionChangeInputContribute(newText));
  const onChangeOutput = (newText) => dispatch(liquidityActions.actionChangeOutputContribute(newText));
  const onMaxInput = (newText) => dispatch(liquidityActions.actionChangeInputContribute(newText));
  const onMaxOutput = (newText) => dispatch(liquidityActions.actionChangeOutputContribute(newText));
  const amountSelector = useSelector(contributeSelector.inputAmountSelector);
  const inputAmount = amountSelector(formConfigsContribute.formName, formConfigsContribute.inputToken);
  const outputAmount = amountSelector(formConfigsContribute.formName, formConfigsContribute.outputToken);
  const _validateInput = React.useCallback(() => {
    return inputAmount.error;
  }, [inputAmount.error]);
  const _validateOutput = React.useCallback(() => {
    return outputAmount.error;
  }, [outputAmount.error]);
  return (
    <View style={styled.wrapInput}>
      <Field
        component={TradeInputAmount}
        name={formConfigsContribute.inputToken}
        hasInfinityIcon={inputAmount.maxOriginalAmount}
        symbol={inputToken && inputToken?.symbol}
        validate={[
          _validateInput,
          ...validator.combinedAmount,
        ]}
        onChange={onChangeInput}
        editableInput={!inputAmount.loadingBalance}
        loadingBalance={inputAmount.loadingBalance}
        onPressInfinityIcon={() => onMaxInput(inputAmount.maxOriginalAmountText)}
      />
      <AddBreakLine />
      <Field
        component={TradeInputAmount}
        name={formConfigsContribute.outputToken}
        hasInfinityIcon={outputAmount.maxOriginalAmount}
        symbol={outputToken && outputToken?.symbol}
        validate={[
          _validateOutput,
          ...validator.combinedAmount,
        ]}
        onChange={onChangeOutput}
        editableInput={!outputAmount.loadingBalance}
        loadingBalance={outputAmount.loadingBalance}
        onPressInfinityIcon={() => onMaxOutput(outputAmount.maxOriginalAmountText)}
      />
    </View>
  );
};

export const Extra = React.memo(() => {
  const data = useSelector(contributeSelector.mappingDataSelector);
  const renderHooks = () => {
    if (!data) return;
    return (data?.hookFactories || []).map(item => <RowSpaceText {...item} key={item?.label} />);
  };
  return(
    <>
      {renderHooks()}
    </>
  );
});

const ContributeButton = React.memo(({ onSubmit }) => {
  const amountSelector = useSelector(contributeSelector.inputAmountSelector);
  const inputAmount = amountSelector(formConfigsContribute.formName, formConfigsContribute.inputToken);
  const outputAmount = amountSelector(formConfigsContribute.formName, formConfigsContribute.outputToken);
  const { feeAmount } = useSelector(contributeSelector.feeAmountSelector);
  const poolId = useSelector(contributeSelector.poolIDSelector);
  const { amp } = useSelector(contributeSelector.mappingDataSelector);
  const { nftToken } = useSelector(contributeSelector.nftTokenSelector);
  const { isDisabled } = useSelector(contributeSelector.disableContribute);
  const createContributes = async () => {
    if (isDisabled) return;
    const params = {
      fee: feeAmount / 2,
      tokenId1: inputAmount.tokenId,
      tokenId2: outputAmount.tokenId,
      amount1: inputAmount.originalInputAmount,
      amount2: outputAmount.originalInputAmount,
      poolPairID: poolId,
      amp,
      nftId: nftToken,
    };
    onSubmit(params);
  };

  return (
    <ButtonTrade
      btnStyle={mainStyle.button}
      title={LIQUIDITY_MESSAGES.addLiquidity}
      disabled={isDisabled}
      onPress={createContributes}
    />
  );
});

const Contribute = ({
  onInitContribute,
  onCreateContributes,
  visible,
  onCloseModal
}) => {
  const isFetching = useSelector(contributeSelector.statusSelector);
  const onSubmit = (params) => {
    typeof onCreateContributes === 'function' && onCreateContributes(params);
  };
  const onClose = () => {
    onCloseModal();
    onInitContribute();
  };
  React.useEffect(() => {
    if (typeof onInitContribute === 'function') onInitContribute();
  }, []);
  return (
    <>
      <View style={mainStyle.container}>
        <Header title={LIQUIDITY_MESSAGES.addLiquidity} />
        <ScrollView
          refreshControl={(<RefreshControl refreshing={isFetching} onRefresh={onInitContribute} />)}
          showsVerticalScrollIndicator={false}
        >
          <Form>
            {() => (
              <>
                <InputsGroup />
                <ContributeButton onSubmit={onSubmit} />
                <Extra />
              </>
            )}
          </Form>
        </ScrollView>
      </View>
      <NFTTokenBottomBar />
      <SuccessModal
        closeSuccessDialog={onClose}
        title={SUCCESS_MODAL.CREATE_POOL.title}
        buttonTitle="Ok"
        description={SUCCESS_MODAL.CREATE_POOL.desc}
        visible={visible}
      />
    </>
  );
};

ContributeButton.propTypes = {
  onSubmit: PropTypes.func.isRequired
};

Contribute.propTypes = {
  onInitContribute: PropTypes.func.isRequired,
  onCreateContributes: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
};

export default compose(
  withLiquidity,
  withTransaction,
)(memo(Contribute));