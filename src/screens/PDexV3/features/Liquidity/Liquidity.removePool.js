import React, { memo } from 'react';
import { RefreshControl, ScrollView, Text } from 'react-native';
import PropTypes from 'prop-types';
import { styled as mainStyle } from '@screens/PDexV3/PDexV3.styled';
import { Header, SuccessModal, RowSpaceText } from '@src/components';
import {
  formConfigsRemovePool,
  LIQUIDITY_MESSAGES,
  SUCCESS_MODAL,
} from '@screens/PDexV3/features/Liquidity/Liquidity.constant';
import withLiquidity from '@screens/PDexV3/features/Liquidity/Liquidity.enhance';
import {
  createForm,
  RFTradeInputAmount as TradeInputAmount,
  validator,
} from '@components/core/reduxForm';
import styled from '@screens/PDexV3/features/Liquidity/Liquidity.styled';
import { Field } from 'redux-form';
import { AddBreakLine, View } from '@components/core';
import { batch, useDispatch, useSelector } from 'react-redux';
import {
  liquidityActions,
  removePoolSelector,
} from '@screens/PDexV3/features/Liquidity/index';
import { ButtonTrade } from '@components/Button';
import { compose } from 'recompose';
import withTransaction from '@screens/PDexV3/features/Liquidity/Liquidity.enhanceTransaction';
import { useNavigation } from 'react-navigation-hooks';
import NetworkFee from '@src/components/NetworkFee';
import { withLayout_2 } from '@components/Layout';
import { actionRefillPRVModalVisible } from '@src/screens/RefillPRV/RefillPRV.actions';
import { actionFaucetPRV } from '@src/redux/actions/token';
import FaucetPRVModal from '@src/components/Modal/features/FaucetPRVModal';

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
  const inputToken = inputAmount(
    formConfigsRemovePool.formName,
    formConfigsRemovePool.inputToken,
  );
  const outputToken = inputAmount(
    formConfigsRemovePool.formName,
    formConfigsRemovePool.outputToken,
  );
  const { maxInputShareStr, maxOutputShareStr } =
    useSelector(removePoolSelector.maxShareAmountSelector) || {};
  const onChangeInput = (text) =>
    dispatch(liquidityActions.actionChangeInputRemovePool(text));
  const onChangeOutput = (text) =>
    dispatch(liquidityActions.actionChangeOutputRemovePool(text));
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
          validate={[_validateInput, ...validator.combinedNumber]}
          editableInput={!inputToken.loadingBalance}
          srcIcon={inputToken && inputToken?.iconUrl}
          symbol={inputToken && inputToken?.symbol}
          onChange={onChangeInput}
          onPressInfinityIcon={onMaxPress}
          hasInfinityIcon
        />
        <AddBreakLine />
        <Field
          component={TradeInputAmount}
          name={formConfigsRemovePool.outputToken}
          validate={[_validateOutput, ...validator.combinedNumber]}
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
  const dispatch = useDispatch();
  const { disabled } = useSelector(removePoolSelector.disableRemovePool);
  const amountSelector = useSelector(removePoolSelector.inputAmountSelector);
  const { feeAmount } = useSelector(removePoolSelector.feeAmountSelector);
  const poolId = useSelector(removePoolSelector.poolIDSelector);
  const nftId = useSelector(removePoolSelector.nftTokenSelector);
  const inputAmount = amountSelector(
    formConfigsRemovePool.formName,
    formConfigsRemovePool.inputToken,
  );
  const outputAmount = amountSelector(
    formConfigsRemovePool.formName,
    formConfigsRemovePool.outputToken,
  );
  const {
    isEnoughtPRVNeededAfterBurn,
    isCurrentPRVBalanceExhausted,
  } =  useSelector(removePoolSelector.validateTotalBurnPRVSelector);

  const handleSubmit = async () => {
    // console.log('[handleSubmit] disabled ', disabled);
    if (disabled) return;
    // console.log('isEnoughtTotalPRVAfterBurned ', isEnoughtTotalPRVAfterBurned);

    if (isCurrentPRVBalanceExhausted) {
      await dispatch(actionFaucetPRV(<FaucetPRVModal />));
      return;
    }
    
    if (!isEnoughtPRVNeededAfterBurn) {
       dispatch(actionRefillPRVModalVisible(true));
    } else {
      const params = {
        fee: feeAmount,
        poolTokenIDs: [inputAmount.tokenId, outputAmount.tokenId],
        poolPairID: poolId,
        shareAmount: inputAmount.withdraw,
        nftID: nftId,
        amount1: String(inputAmount.originalInputAmount),
        amount2: String(outputAmount.originalInputAmount),
      };
      onSubmit(params);
    }
  };

  return (
    <ButtonTrade
      btnStyle={mainStyle.button}
      title={LIQUIDITY_MESSAGES.removePool}
      onPress={handleSubmit}
    />
  );
});

export const Extra = React.memo(() => {
  const hooks = useSelector(removePoolSelector.hookFactoriesSelector);
  const renderHooks = () => {
    return hooks.filter(item => !!item).map(item => <RowSpaceText {...item} key={item?.label} />);
  };
  return(
    <View style={{ marginTop: 20 }}>
      {renderHooks()}
    </View>
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
  const { feeAmountStr, showFaucet } = useSelector(
    removePoolSelector.feeAmountSelector,
  );
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
        <Extra />
        {showFaucet && <NetworkFee feeStr={feeAmountStr} />}
      </View>
    </>
  );

  React.useEffect(() => {
    onInitRemovePool();
  }, []);
  return (
    <>
      <Header style={styled.padding} />
      <View borderTop style={styled.container}>
        <ScrollView
          refreshControl={(
            <RefreshControl
              refreshing={isFetching}
              onRefresh={onInitRemovePool}
            />
          )}
          showsVerticalScrollIndicator={false}
        >
          <Form>{renderContent()}</Form>
        </ScrollView>
      </View>
      <SuccessModal
        closeSuccessDialog={onClose}
        title={SUCCESS_MODAL.REMOVE_POOL.title}
        buttonTitle="OK"
        extraInfo={SUCCESS_MODAL.REMOVE_POOL.desc}
        visible={visible}
      />
    </>
  );
};

RemovePool.defaultProps = {
  error: '',
};

RemovePool.propTypes = {
  onInitRemovePool: PropTypes.func.isRequired,
  onRemoveContribute: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  error: PropTypes.string,
};

RemoveLPButton.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default compose(
  withLiquidity,
  withLayout_2,
  withTransaction,
)(memo(RemovePool));
