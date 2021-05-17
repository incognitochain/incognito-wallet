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
import { selectedPrivacySelector } from '@src/redux/selectors';
import { selectedReceiverSelector } from '@src/redux/selectors/receivers';
import { CONSTANT_KEYS } from '@src/constants';
import { isEqual, toLower } from 'lodash';
import { formName } from './FrequentReceivers.form';

const enhance = (WrappedComp) => (props) => {
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const action = useNavigationParam('action') || 'create';
  const info = useNavigationParam('info');
  const keySave = useNavigationParam('keySave');
  const headerTitle = useNavigationParam('headerTitle');
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { address = '', name = '' } = info;
  const isUpdate = action === 'update';
  const titleBtnSubmit = isUpdate ? 'Save changes' : 'Save to address book';
  const isFormValid = useSelector((state) => isValid(formName)(state));
  const selector = formValueSelector(formName);
  const nameInput = useSelector((state) => selector(state, 'name')) || '';
  let shouldUpdate = !isEqual(toLower(nameInput), toLower(name));
  const disabledBtn = !isFormValid || (isUpdate && !shouldUpdate);
  const selectedReceiver = useSelector(selectedReceiverSelector);
  const shouldShowNetwork =
    selectedReceiver?.keySave ===
    CONSTANT_KEYS.REDUX_STATE_RECEIVERS_OUT_NETWORK;

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
            rootNetworkName: selectedPrivacy?.rootNetworkName,
            tokenId: selectedPrivacy?.tokenId,
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
    } catch (error) {
      new ExHandler(error).showErrorToast();
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
    if (!isUpdate) {
      return dispatch(change(formName, 'address', address));
    }
    if (selectedReceiver) {
      const { address, name } = selectedReceiver;
      dispatch(change(formName, 'address', address));
      dispatch(change(formName, 'name', name));
      if (shouldShowNetwork) {
        dispatch(
          change(formName, 'networkName', selectedReceiver?.rootNetworkName),
        );
      }
    }
  }, [selectedReceiver, address]);
  return (
    <WrappedComp
      {...{
        ...props,
        onSaveReceiver,
        headerTitle,
        disabledBtn,
        titleBtnSubmit,
        shouldShowNetwork,
      }}
    />
  );
};

export default compose(
  withLayout_2,
  enhance,
);
