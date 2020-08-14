import React from 'react';
import { ButtonBasic } from '@src/components/Button';
import { StyleSheet } from 'react-native';
import { ExHandler } from '@src/services/exception';
import PropTypes from 'prop-types';
import { FONT, COLORS } from '@src/styles';
import { isFieldExist } from './FrequentReceivers.utils';

const styleSheet = StyleSheet.create({
  btnSaveReceivers: {
    marginTop: 50,
    width: '100%',
  },
  titleReceivers: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 3,
  },
});

export const useBtnSaveReceiver = (props) => {
  const { onSaveReceivers, receivers, toAddress } = props;
  const [btnSave, setBtnSave] = React.useState(null);
  React.useEffect(() => {
    renderBtnSaveReceiver();
    return () => {
      renderBtnSaveReceiver();
    };
  }, []);
  const renderBtnSaveReceiver = async () => {
    try {
      const isAddrExist = (await isFieldExist(
        'address',
        toAddress,
        '',
        receivers,
      )).error;
      if (!isAddrExist) {
        await setBtnSave(
          <ButtonBasic
            btnStyle={styleSheet.btnSaveReceivers}
            title="Save this address"
            onPress={onSaveReceivers}
            titleStyle={styleSheet.titleReceivers}
          />,
        );
      }
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  return [btnSave];
};

useBtnSaveReceiver.propTypes = {
  onSaveReceivers: PropTypes.func.isRequired,
  toAddress: PropTypes.string.isRequired,
  receivers: PropTypes.array.isRequired,
};
