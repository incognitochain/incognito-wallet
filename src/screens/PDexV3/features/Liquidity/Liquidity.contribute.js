import React, {memo} from 'react';
import {RefreshControl, ScrollView, Text, View} from 'react-native';
import PropTypes from 'prop-types';
import {styled as mainStyle} from '@screens/PDexV3/PDexV3.styled';
import {Header, Row, RowSpaceText, SuccessModal} from '@src/components';
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
import {MaxIcon} from '@components/Icons';
import LPHistoryIcon from '@screens/PDexV3/features/Liquidity/Liquidity.iconHistory';

const initialFormValues = {
  inputToken: '',
  outputToken: '',
};

const Form = createForm(formConfigsContribute.formName, {
  initialValues: initialFormValues,
  destroyOnUnmount: true,
  enableReinitialize: true,
});

const InputsGroup = React.memo(() => {
  const dispatch = useDispatch();
  const { inputToken, outputToken } = useSelector(contributeSelector.mappingDataSelector);
  const onChangeInput = (newText) => dispatch(liquidityActions.actionChangeInputContribute(newText));
  const onChangeOutput = (newText) => dispatch(liquidityActions.actionChangeOutputContribute(newText));
  const onMaxInput = () => dispatch(liquidityActions.actionChangeInputContribute(inputAmount.maxOriginalAmountText));
  const onMaxOutput = () => dispatch(liquidityActions.actionChangeOutputContribute(outputAmount.maxOriginalAmountText));
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
    <View style={styled.inputBox}>
      <Field
        component={TradeInputAmount}
        name={formConfigsContribute.inputToken}
        symbol={inputToken && inputToken?.symbol}
        srcIcon={inputToken && inputToken?.iconUrl}
        validate={[
          _validateInput,
          ...validator.combinedAmount,
        ]}
        visibleHeader
        label="Amount"
        hasInfinityIcon
        onChange={onChangeInput}
        editableInput={!inputAmount.loadingBalance}
        loadingBalance={inputAmount.loadingBalance}
        onPressInfinityIcon={onMaxInput}
      />
      <AddBreakLine />
      <Field
        component={TradeInputAmount}
        name={formConfigsContribute.outputToken}
        hasInfinityIcon
        symbol={outputToken && outputToken?.symbol}
        srcIcon={outputToken && outputToken?.iconUrl}
        validate={[
          _validateOutput,
          ...validator.combinedAmount,
        ]}
        visibleHeader
        label="Amount"
        onChange={onChangeOutput}
        editableInput={!outputAmount.loadingBalance}
        loadingBalance={outputAmount.loadingBalance}
        onPressInfinityIcon={onMaxOutput}
      />
    </View>
  );
});

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
      amount1: String(inputAmount.originalInputAmount),
      amount2: String(outputAmount.originalInputAmount),
      poolPairID: poolId,
      amp,
      nftID: nftToken,
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
  onCloseModal,
  error
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
      <View style={styled.container}>
        <Header style={styled.padding} />
        <ScrollView
          refreshControl={(<RefreshControl refreshing={isFetching} onRefresh={onInitContribute} />)}
          showsVerticalScrollIndicator={false}
        >
          <Form>
            {() => (
              <>
                <InputsGroup />
                <View style={styled.padding}>
                  {!!error && <Text style={styled.warning}>{error}</Text>}
                  <ContributeButton onSubmit={onSubmit} />
                  <Extra />
                </View>
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
        extraInfo={SUCCESS_MODAL.CREATE_POOL.desc}
        visible={visible}
      />
    </>
  );
};

ContributeButton.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

Contribute.defaultProps = {
  error: ''
};

Contribute.propTypes = {
  onInitContribute: PropTypes.func.isRequired,
  onCreateContributes: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  error: PropTypes.string
};

export default compose(
  withLiquidity,
  withTransaction,
)(memo(Contribute));
