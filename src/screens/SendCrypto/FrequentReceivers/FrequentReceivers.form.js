import React from 'react';
import {View, Text} from 'react-native';
import {TextInput} from '@src/shared/components/input';
import {Button} from '@src/components/core';
import PropTypes from 'prop-types';
import {styled} from './FrequentReceivers.styled';

const Form = props => {
  const {
    onSaveReceiver,
    inputName,
    saved,
    toAddress,
    onChangeText,
    inputAddr,
  } = props;
  return (
    <View style={styled.container}>
      <TextInput
        labelStyle={styled.label}
        containerStyled={styled.input}
        label="Name"
        autoFocus
        placeholder={'Type receiver\'s name'}
        value={inputName.value}
        validated={inputName.validated}
        onChangeText={onChangeText}
        maxLength={50}
        onSubmitEditing={onSaveReceiver}
      />
      <TextInput
        labelStyle={styled.label}
        containerStyled={styled.input}
        label="Address"
        value={toAddress}
        editable={false}
        validated={inputAddr.validated}
      />
      <Text style={styled.tip}>
        *Save the address for more better sending experience in future.
      </Text>
      <Button
        title={saved ? 'Saved' : 'Save to address book'}
        onPress={onSaveReceiver}
      />
    </View>
  );
};

Form.propTypes = {
  onSaveReceiver: PropTypes.func.isRequired,
  inputName: PropTypes.shape({
    value: PropTypes.string.isRequired,
    validated: PropTypes.shape({
      error: PropTypes.bool.isRequired,
      message: PropTypes.string.isRequired,
    }),
  }).isRequired,
  inputAddr: PropTypes.shape({
    value: PropTypes.string.isRequired,
    validated: PropTypes.shape({
      error: PropTypes.bool.isRequired,
      message: PropTypes.string.isRequired,
    }),
  }).isRequired,
  saved: PropTypes.bool.isRequired,
  toAddress: PropTypes.string.isRequired,
  onChangeText: PropTypes.func.isRequired,
};

export default Form;
