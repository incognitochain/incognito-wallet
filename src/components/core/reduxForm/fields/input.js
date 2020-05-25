import React from 'react';
import { TextInput } from '@src/components/core';
import createField from './createField';

const renderCustomField = ({ input, ...props }) => {
  const { onChange, onBlur, onFocus, value, ...rest } = input;
  return (
    <TextInput
      {...{ ...props, ...rest }}
      onChangeText={t => onChange(t)}
      onBlur={onBlur}
      onFocus={onFocus}
      defaultValue={value}
      ellipsize="middle"
    />
  );
};

const InputField = createField({
  fieldName: 'InputField',
  render: renderCustomField,
});

export default InputField;
