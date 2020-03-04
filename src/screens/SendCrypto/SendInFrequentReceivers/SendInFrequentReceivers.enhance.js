import React from 'react';
import {useNavigationParam, useNavigation} from 'react-navigation-hooks';
import {ExHandler} from '@src/services/exception';
import LocalDatabase from '@src/utils/LocalDatabase';
import {validateNotEmpty} from '@src/shared/components/input/input.utils';
import routeNames from '@src/router/routeNames';
import {Toast} from '@src/components/core';
import {isFieldExist} from './SendInFrequentReceivers.utils';

export const initInputName = {
  value: '',
  validated: {
    error: false,
    message: '',
  },
};

export const initInputAddress = {
  value: '',
  validated: {
    error: false,
    message: '',
  },
};

const enhance = WrappedComp => props => {
  const info = useNavigationParam('info');
  const navigation = useNavigation();
  const {toAddress} = info;
  const [state, setState] = React.useState({
    inputName: {...initInputName},
    inputAddr: {...initInputAddress},
    saved: false,
  });
  const {inputName, inputAddr, saved} = state;
  const onSaveReceiver = async () => {
    try {
      const name = inputName.value.trim();
      const address = toAddress.trim();
      const valName = validateNotEmpty(name);
      const validNameExist = await isFieldExist('name', name, 'Name is exist!');
      const validAddrExist = await isFieldExist(
        'address',
        address,
        'Address is exist!',
      );
      if (valName.error) {
        return await setState({
          ...state,
          inputName: {...inputName, validated: valName},
        });
      }
      if (validNameExist.error) {
        return await setState({
          ...state,
          inputName: {...inputName, validated: validNameExist},
        });
      }
      if (validAddrExist.error) {
        return await setState({
          ...state,
          inputAddr: {...inputAddr, validated: validAddrExist},
        });
      }
      const receiver = {
        name,
        address,
      };
      await LocalDatabase.setFrequentReceivers(receiver);
      Toast.showInfo('Saved!');
      navigation.navigate(routeNames.RootTab);
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  const onChangeText = value =>
    setState({
      ...state,
      inputName: {
        value,
        validated: {...initInputName.validated},
      },
    });
  return (
    <WrappedComp
      {...{
        ...props,
        onSaveReceiver,
        inputName,
        inputAddr,
        saved,
        toAddress,
        onChangeText,
      }}
    />
  );
};

export default enhance;
