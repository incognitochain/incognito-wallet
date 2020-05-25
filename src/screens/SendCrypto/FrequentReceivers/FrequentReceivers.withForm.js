import React from 'react';
import {useNavigationParam, useNavigation} from 'react-navigation-hooks';
import {ExHandler} from '@src/services/exception';
import {validateNotEmpty} from '@src/shared/components/input/input.utils';
import routeNames from '@src/router/routeNames';
import {Toast} from '@src/components/core';
import {isFieldExist} from '@src/screens/SendCrypto/FrequentReceivers/FrequentReceivers.utils';
import {useSelector, useDispatch} from 'react-redux';
import {receiversSelector} from '@src/redux/selectors/receivers';
import {actionCreate, actionUpdate} from '@src/redux/actions/receivers';
import {compose} from 'recompose';
import {withHeaderTitle} from '@src/components/Hoc';

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
  const action = useNavigationParam('action') || 'create';
  const info = useNavigationParam('info');
  const keySave = useNavigationParam('keySave');
  const {receivers} = useSelector(receiversSelector)[keySave];
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {toAddress = '', name = ''} = info;
  const [state, setState] = React.useState({
    inputName: {...initInputName},
    inputAddr: {...initInputAddress},
    saved: false,
  });
  const {inputName, inputAddr, saved} = state;
  const onCreateReceiver = async () => {
    try {
      const nameReceiver = inputName.value.trim();
      const addressReceiver = toAddress.trim();
      const valName = validateNotEmpty(nameReceiver);
      const validNameExist = isFieldExist(
        'name',
        nameReceiver,
        'Name is exist!',
        receivers,
      );
      const validAddrExist = isFieldExist(
        'address',
        addressReceiver,
        'Address is exist!',
        receivers,
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
        name: nameReceiver,
        address: addressReceiver,
      };
      await dispatch(
        actionCreate({
          keySave,
          receiver: {
            ...receiver,
            recently: new Date().getTime(),
          },
        }),
      );
      Toast.showInfo('Saved!');
      return navigation.navigate(routeNames.Wallet);
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };

  const onUpdateReceiver = async () => {
    try {
      const nameReceiver = inputName.value.trim();
      const addressReceiver = toAddress.trim();
      const valName = validateNotEmpty(nameReceiver);
      const validNameExist = isFieldExist(
        'name',
        nameReceiver,
        'Name is exist!',
        receivers,
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
      const receiver = {
        name: nameReceiver,
        address: addressReceiver,
      };
      await dispatch(
        actionUpdate({
          keySave,
          receiver,
        }),
      );
      Toast.showInfo('Updated!');
      return navigation.goBack();
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };

  const onSaveReceiver = async () => {
    if (action === 'update') {
      return onUpdateReceiver();
    }
    return onCreateReceiver();
  };
  const onChangeText = value =>
    setState({
      ...state,
      inputName: {
        value,
        validated: {...initInputName.validated},
      },
    });
  const initData = async () => {
    try {
      await setState({
        ...state,
        inputName: {
          ...inputName,
          value: name,
        },
        inputAddr: {
          ...inputAddr,
          value: toAddress,
        },
      });
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  React.useEffect(() => {
    initData();
  }, [info]);
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
        action,
      }}
    />
  );
};

export default compose(withHeaderTitle, enhance);
