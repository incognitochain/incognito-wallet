/* eslint-disable import/no-cycle */
import React from 'react';
import { useNavigationParam, useNavigation } from 'react-navigation-hooks';
import { ExHandler } from '@src/services/exception';
import routeNames from '@src/router/routeNames';
import { Toast } from '@src/components/core';
import { useDispatch, useSelector } from 'react-redux';
import { actionCreate, actionUpdate } from '@src/redux/actions/receivers';
import { compose } from 'recompose';
import { withLayout_2 } from '@src/components/Layout';
import { formValueSelector, isValid, change } from 'redux-form';
import { Keyboard } from 'react-native';
import { receiversSelector } from '@src/redux/selectors/receivers';
import { CONSTANT_KEYS } from '@src/constants';
import { formName } from './FrequentReceivers.form';

const enhance = (WrappedComp) => (props) => {
  const action = useNavigationParam('action') || 'create';
  const info = useNavigationParam('info');
  const keySave = useNavigationParam('keySave');
  const headerTitle = useNavigationParam('headerTitle');
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { toAddress = '', name = '' } = info;
  const isUpdate = action === 'update';
  const titleBtnSubmit = isUpdate ? 'Save changes' : 'Save to address book';
  const isFormValid = useSelector((state) => isValid(formName)(state));
  const selector = formValueSelector(formName);
  const nameInput = useSelector((state) => selector(state, 'name')) || '';
  const accounts = useSelector(receiversSelector)[keySave]['receivers'] || [];
  let shouldUpdate = nameInput !== name;
  const disabledBtn = !isFormValid || (isUpdate && !shouldUpdate);
  const onCreateReceiver = async ({ name, address }) => {
    try {
      const receiver = {
        name,
        address,
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

  const onUpdateReceiver = async ({ name, address }) => {
    try {
      // Check if name is existing, return dialog message
      let shouldBreakIfDuplicate = false;
      accounts.forEach(element => {
        if (element?.name === name) {
          shouldBreakIfDuplicate = true;
          return new ExHandler({}, 'This name is already existed').showErrorToast();
        }
      });
      if (!shouldBreakIfDuplicate) {
        const receiver = {
          name,
          address,
        };
        await dispatch(
          actionUpdate({
            keySave,
            receiver,
          }),
        );
        Toast.showInfo('Updated!');
        return navigation.pop();
      } else {
        return new ExHandler({}, 'This name is already existed').showErrorToast();
      }
    } catch (error) {
      new ExHandler(error?.message || error).showErrorToast();
    }
  };

  const onSaveReceiver = async (data) => {
    if (disabledBtn) {
      return;
    }
    Keyboard.dismiss();
    if (action === 'update') {
      return onUpdateReceiver(data);
    }
    return onCreateReceiver(data);
  };

  React.useEffect(() => {
    if (isUpdate) {
      dispatch(change(formName, 'name', name));
    }
    dispatch(change(formName, 'address', toAddress));
  }, [toAddress]);
  return (
    <WrappedComp
      {...{
        ...props,
        onSaveReceiver,
        headerTitle,
        disabledBtn,
        titleBtnSubmit,
      }}
    />
  );
};

export default compose(
  withLayout_2,
  enhance,
);
