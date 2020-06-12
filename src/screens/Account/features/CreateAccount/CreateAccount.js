import { View } from 'react-native';
import { Field } from 'redux-form';
import { createForm, InputField } from '@src/components/core/reduxForm';
import PropTypes from 'prop-types';
import React from 'react';
import Header from '@src/components/Header';
import { ButtonBasic } from '@src/components/Button';
// eslint-disable-next-line import/no-cycle
import withCreateAccount from './CreateAccount.enhance';
import styled from './CreateAccount.styled';

export const formCreateAccount = {
  formName: 'formCreateAccount',
  accountName: 'accountName',
};

const Form = createForm(formCreateAccount.formName);

const CreateAccount = ({
  disabledForm,
  getAccountValidator,
  handleCreateAccount,
}) => {
  return (
    <View style={styled.container}>
      <Header title="Create keychain" />
      <Form style={styled.form}>
        {({ handleSubmit, submitting }) => (
          <View>
            <Field
              autoFocus
              component={InputField}
              name="accountName"
              placeholder="Keychain name"
              label="Keychain name"
              validate={getAccountValidator()}
              componentProps={{
                style: {
                  marginTop: 0,
                },
              }}
            />
            <ButtonBasic
              title={!submitting ? 'Create keychain' : 'Creating keychain...'}
              btnStyle={styled.submitBtn}
              onPress={handleSubmit(handleCreateAccount)}
              disabled={disabledForm || submitting}
            />
          </View>
        )}
      </Form>
    </View>
  );
};

CreateAccount.defaultProps = {};

CreateAccount.propTypes = {
  disabledForm: PropTypes.bool.isRequired,
  handleCreateAccount: PropTypes.func.isRequired,
  getAccountValidator: PropTypes.func.isRequired,
};

export default withCreateAccount(CreateAccount);
