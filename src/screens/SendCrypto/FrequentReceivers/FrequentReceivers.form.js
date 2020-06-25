/* eslint-disable import/no-cycle */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import Header from '@src/components/Header';
import { Field } from 'redux-form';
import {
  InputField,
  validator,
  createForm,
} from '@src/components/core/reduxForm';
import { ButtonBasic } from '@src/components/Button';
import withForm from './FrequentReceivers.withForm';

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

export const formName = 'formFrequentReceivers';

const isRequired = validator.required();

const FormDt = createForm(formName);

const Form = (props) => {
  const { headerTitle, titleBtnSubmit, onSaveReceiver, disabledBtn } = props;
  return (
    <View style={styled.container}>
      <Header title={headerTitle} />
      <FormDt style={styled.form}>
        {({ handleSubmit }) => (
          <View>
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
              componentProps={{
                canEditable: false,
              }}
            />
            <ButtonBasic
              title={titleBtnSubmit}
              btnStyle={styled.submitBtn}
              onPress={handleSubmit(onSaveReceiver)}
              disabled={disabledBtn}
            />
          </View>
        )}
      </FormDt>
    </View>
  );
};

Form.propTypes = {
  headerTitle: PropTypes.string.isRequired,
  onSaveReceiver: PropTypes.func.isRequired,
  disabledBtn: PropTypes.bool.isRequired,
  titleBtnSubmit: PropTypes.string.isRequired,
};

export default withForm(Form);
