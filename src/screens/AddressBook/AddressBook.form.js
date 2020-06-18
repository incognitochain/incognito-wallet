import React from 'react';
import { View, StyleSheet, Keyboard, Text } from 'react-native';
import Header from '@src/components/Header';
import { useNavigationParam, useNavigation } from 'react-navigation-hooks';
import { useDispatch, useSelector } from 'react-redux';
import { Field, change, isValid, formValueSelector } from 'redux-form';
import {
  InputField,
  validator,
  createForm,
} from '@src/components/core/reduxForm';
import { ButtonBasic } from '@src/components/Button';
import { ExHandler } from '@src/services/exception';
import { withLayout_2 } from '@src/components/Layout';
import { Toast } from '@src/components/core';
import { addressBookByIdSelector } from './AddressBook.selector';
import { actionUpdate, actionCreate } from './AddressBook.actions';

const isRequired = validator.required();

const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    flex: 1,
    marginTop: 15,
  },
  submitBtn: {
    marginTop: 50,
  },
});

export const formName = 'addressBook';

const Form = createForm(formName);

const AddressBookForm = () => {
  const navigation = useNavigation();
  const { isUpdate, id, address } = useNavigationParam('params') || {
    isUpdate: false,
    id: null,
    address: '',
  };
  const dispatch = useDispatch();
  const addressBook = useSelector(addressBookByIdSelector)(id);
  const isFormValid = useSelector((state) => isValid(formName)(state));
  const selector = formValueSelector(formName);
  const nameInput = useSelector((state) => selector(state, 'name')) || '';
  const shouldUpdate = nameInput !== addressBook?.name;
  const disabledBtn = !isFormValid || (isUpdate && !shouldUpdate);
  const titleBtnSubmit = isUpdate
    ? 'Edit this address book'
    : 'Save to address book';
  const onSaveAddressBook = async ({ name, address }) => {
    try {
      Keyboard.dismiss();
      if (disabledBtn) {
        return;
      }
      if (isUpdate) {
        await dispatch(
          actionUpdate({
            name,
            id,
          }),
        );
      } else {
        await dispatch(
          actionCreate({
            name,
            address,
          }),
        );
      }
      Toast.showInfo(isUpdate ? 'Edited' : 'Created!');
      navigation.pop();
    } catch (error) {
      new ExHandler(error?.message).showErrorToast();
    }
  };
  React.useEffect(() => {
    if (!!isUpdate && !!addressBook) {
      dispatch(change(formName, 'name', addressBook?.name));
      dispatch(change(formName, 'address', addressBook?.address));
    }
    if (!isUpdate) {
      dispatch(change(formName, 'address', address));
    }
  }, [id]);
  return (
    <View style={styled.container}>
      <Header title="Address book" />
      <Form style={styled.form}>
        {({ handleSubmit }) => (
          <>
            <Field
              componentProps={{
                style: {
                  marginTop: 0,
                },
              }}
              component={InputField}
              placeholder="Name"
              name="name"
              label="Name"
              validate={isRequired}
              maxLength={50}
            />
            <Field
              component={InputField}
              label="Address"
              name="address"
              placeholder="Address"
              validate={isRequired}
              initialValue={addressBook?.address || ''}
              componentProps={{
                canEditable: false,
              }}
            />
            <ButtonBasic
              title={titleBtnSubmit}
              btnStyle={styled.submitBtn}
              onPress={handleSubmit(onSaveAddressBook)}
              disabled={disabledBtn}
            />
          </>
        )}
      </Form>
    </View>
  );
};

AddressBookForm.propTypes = {};

export default withLayout_2(AddressBookForm);
