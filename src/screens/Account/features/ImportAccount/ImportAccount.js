import { Text, TouchableOpacity } from '@src/components/core';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import {
  createForm,
  InputField,
  InputQRField,
} from '@src/components/core/reduxForm';
import React from 'react';
import Header from '@src/components/Header';
import { View } from 'react-native';
import { ButtonBasic } from '@src/components/Button';
import styleSheet from './ImportAccount.styled';
// eslint-disable-next-line import/no-cycle
import withImportAccount from './ImportAccount.enhance';

export const formImportAccount = {
  formName: 'formImportAccount',
  privateKey: 'privateKey',
  accountName: 'accountName',
};

const Form = createForm(formImportAccount.formName);

const ImportAccount = (props) => {
  const {
    getAccountValidator,
    getPrivateKeyValidator,
    handleImportAccount,
    toggle,
    randomName,
    handleChangeRandomName,
    disabledForm,
  } = props;
  return (
    <View style={styleSheet.container}>
      <Header title="Import keychain" />
      <Form style={styleSheet.form}>
        {({ handleSubmit, submitting }) => (
          <View>
            {toggle && randomName ? (
              <View style={styleSheet.randomNameField}>
                <Text style={styleSheet.randomNameLabel}>Keychain name</Text>
                <View style={styleSheet.randomNameValue}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styleSheet.randomNameText}
                  >
                    {randomName}
                  </Text>
                  <TouchableOpacity
                    onPress={handleChangeRandomName}
                    style={styleSheet.randomNameChangeBtn}
                  >
                    <Text style={styleSheet.randomNameChangeBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Field
                component={InputField}
                componentProps={{ autoFocus: true, style: { marginTop: 0 } }}
                name="accountName"
                placeholder="Keychain name"
                label="Keychain name"
                validate={getAccountValidator()}
              />
            )}
            <Field
              component={InputQRField}
              name="privateKey"
              placeholder="Enter private key"
              label="Private Key"
              validate={getPrivateKeyValidator()}
            />
            <ButtonBasic
              title={submitting ? 'Importing keychain...' : 'Import keychain'}
              btnStyle={styleSheet.submitBtn}
              onPress={handleSubmit(handleImportAccount)}
              disabled={disabledForm || submitting}
            />
          </View>
        )}
      </Form>
    </View>
  );
};

ImportAccount.defaultProps = {};

ImportAccount.propTypes = {
  disabledForm: PropTypes.bool.isRequired,
  getAccountValidator: PropTypes.func.isRequired,
  getPrivateKeyValidator: PropTypes.func.isRequired,
  handleImportAccount: PropTypes.func.isRequired,
  toggle: PropTypes.bool.isRequired,
  randomName: PropTypes.string.isRequired,
  handleChangeRandomName: PropTypes.func.isRequired,
};

export default withImportAccount(ImportAccount);
