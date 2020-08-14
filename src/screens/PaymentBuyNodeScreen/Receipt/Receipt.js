/* eslint-disable react-native/no-raw-text */
import {
  Container,
  Text,
  View,
  Button,
  Divider,
  ScrollView,
} from '@src/components/core';
import {COLORS} from '@src/styles';
import formatUtil from '@src/utils/format';
import PropTypes from 'prop-types';
import React from 'react';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import {CONSTANT_COMMONS, CONSTANT_KEYS} from '@src/constants';
import {useBtnSaveReceiver} from '@src/screens/SendCrypto/FrequentReceivers/FrequentReceivers.hooks';
import {sendInReceiversSelector} from '@src/redux/selectors/receivers';
import {useSelector, useDispatch} from 'react-redux';
import {actionUpdateRecently} from '@src/redux/actions/receivers';
import styleSheet from './style';

const Row = ({label, value, valueProps}) => (
  <View style={styleSheet.rowText}>
    <Text style={styleSheet.labelText} numberOfLines={1} ellipsizeMode="tail">
      {label}:
    </Text>
    <Text
      style={styleSheet.valueText}
      numberOfLines={1}
      ellipsizeMode="tail"
      {...valueProps}
    >
      {value}
    </Text>
  </View>
);

const Receipt = ({info, onBack, onSaveReceivers}) => {
  const {
    time,
    amount,
    amountUnit,
    toAddress,
    fee,
    feeUnit,
    pDecimals,
    title,
  } = info;
  const dispatch = useDispatch();
  const {receivers} = useSelector(sendInReceiversSelector);
  const [btnSaveReceiver] = useBtnSaveReceiver({
    onSaveReceivers,
    toAddress,
    receivers,
  });
  const onUpdateRecentlyAddress = async () => {
    await dispatch(
      actionUpdateRecently({
        keySave: CONSTANT_KEYS.REDUX_STATE_RECEIVERS_IN_NETWORK,
        receiver: {
          address: toAddress,
        },
      }),
    );
  };
  React.useEffect(() => {
    onUpdateRecentlyAddress();
  }, []);
  return (
    <ScrollView style={styleSheet.container}>
      <Container style={styleSheet.content}>
        <SimpleLineIcons name="check" size={70} color={COLORS.primary} />
        <Text style={styleSheet.title}>{title}</Text>
        <Divider
          color={COLORS.lightGrey5}
          height={1.5}
          style={styleSheet.divider}
        />
        <View style={styleSheet.infoContainer}>
          {!!toAddress && (
            <Row
              label="To"
              value={toAddress}
              valueProps={{ellipsizeMode: 'middle'}}
            />
          )}
          {!!time && (
            <Row label="Time" value={formatUtil.formatDateTime(time)} />
          )}
          {!!(amount === 0 || !!amount) && (
            <Row
              label="Amount"
              value={`${formatUtil.amount(amount, pDecimals)} ${amountUnit}`}
            />
          )}
          {(fee === 0 || !!fee) && (
            <Row
              label="Fee"
              value={`${formatUtil.amountFull(
                fee,
                feeUnit === CONSTANT_COMMONS.CRYPTO_SYMBOL.PRV
                  ? CONSTANT_COMMONS.DECIMALS.MAIN_CRYPTO_CURRENCY
                  : pDecimals,
              )} ${feeUnit}`}
            />
          )}
        </View>
        <Divider
          color={COLORS.lightGrey5}
          height={1.5}
          style={styleSheet.divider}
        />
        <Button
          style={styleSheet.backButton}
          title="Back to Wallet"
          onPress={onBack}
        />
        {btnSaveReceiver}
      </Container>
    </ScrollView>
  );
};

Row.defaultProps = {
  value: null,
  valueProps: {},
};

Row.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  valueProps: PropTypes.object,
};

Receipt.defaultProps = {
  info: {},
};

Receipt.propTypes = {
  onBack: PropTypes.func.isRequired,
  onSaveReceivers: PropTypes.func.isRequired,
  info: PropTypes.shape({
    toAddress: PropTypes.string,
    time: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.number,
    ]),
    amount: PropTypes.number,
    amountUnit: PropTypes.string,
    fee: PropTypes.number,
    feeUnit: PropTypes.string,
    pDecimals: PropTypes.number,
    decimals: PropTypes.number,
    title: PropTypes.string,
  }),
};

export default Receipt;
