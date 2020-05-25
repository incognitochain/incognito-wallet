import React from 'react';
import PropTypes from 'prop-types';
import formatUtil from '@src/utils/format';
import { CONSTANT_COMMONS, CONSTANT_KEYS } from '@src/constants';
import { useDispatch, useSelector } from 'react-redux';
import { actionToggleModal } from '@src/components/Modal';
import { useNavigation } from 'react-navigation-hooks';
import { NavigationActions } from 'react-navigation';
import routeNames from '@src/router/routeNames';
import { ExHandler } from '@src/services/exception';
import { withdrawReceiversSelector } from '@src/redux/selectors/receivers';
import { useBtnSaveReceiver } from '../FrequentReceivers/FrequentReceivers.hooks';

const enhance = WrappedComp => props => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { receivers } = useSelector(withdrawReceiversSelector);
  const {
    toAddress,
    lockTime,
    pDecimals,
    amountPToken,
    feeNativeToken,
    feePToken,
    tokenSymbol,
  } = props;
  const time = formatUtil.formatDateTime(lockTime * 1000);
  const amount = `${formatUtil.amount(amountPToken, pDecimals)} ${tokenSymbol}`;
  const feeByPToken = !!feePToken;
  const fee = (feeByPToken ? feePToken : feeNativeToken) * 2;
  const amountFee = `${formatUtil.amountFull(
    fee,
    feeByPToken ? pDecimals : CONSTANT_COMMONS.DECIMALS.MAIN_CRYPTO_CURRENCY,
  )} ${feeByPToken ? tokenSymbol : CONSTANT_COMMONS.CRYPTO_SYMBOL.PRV}`;
  const infoFactories = [
    {
      label: 'To',
      desc: toAddress,
      disabled: !toAddress,
    },
    {
      label: 'Time',
      desc: time,
      disabled: !lockTime,
    },
    {
      label: 'Amount',
      desc: amount,
      disabled: !amount,
    },
    {
      label: 'Fee',
      desc: amountFee,
      disabled: !amountFee,
    },
  ];
  const onBack = () => {
    dispatch(
      actionToggleModal({
        visible: false,
        data: null,
      }),
    );
    navigation.reset(
      [NavigationActions.navigate({ routeName: routeNames.Wallet })],
      0,
    );
  };
  const onSaveReceivers = async () => {
    try {
      navigation.navigate(routeNames.FrequentReceiversForm, {
        info: {
          toAddress,
        },
        keySave: CONSTANT_KEYS.REDUX_STATE_RECEIVERS_OUT_NETWORK,
        headerTitle: 'Save address',
      });
      await dispatch(
        actionToggleModal({
          visible: false,
          data: null,
        }),
      );
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  const [btnSaveReceiver] = useBtnSaveReceiver({
    onSaveReceivers,
    receivers,
    toAddress,
  });
  return (
    <WrappedComp {...{ ...props, onBack, infoFactories, btnSaveReceiver }} />
  );
};

enhance.defaultProps = {
  title: '',
  toAddress: '',
  lockTime: 0,
  pDecimals: CONSTANT_COMMONS.DECIMALS.MAIN_CRYPTO_CURRENCY,
  amountPToken: 0,
  feeNativeToken: 0,
  feePToken: 0,
  tokenSymbol: '',
};

enhance.propTypes = {
  title: PropTypes.string,
  toAddress: PropTypes.string,
  lockTime: PropTypes.number,
  pDecimals: PropTypes.string,
  amountPToken: PropTypes.number,
  feeNativeToken: PropTypes.number,
  feePToken: PropTypes.number,
  tokenSymbol: PropTypes.string,
};

export default enhance;
