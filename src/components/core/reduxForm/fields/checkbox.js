import React from 'react';
import { CheckBox } from '@src/components/core';
import createField from './createField';

const renderCustomField = ({ input, ...props }) => {
  const { value } = input;
  const { onPress, title, containerStyle } = props;
  let _value = false;

  try {
    _value = JSON.parse(value);
  } catch (e) {
    _value = false;
  }
  
  return (
    <CheckBox
      {...props}
      title={title}
      checked={_value}
      containerStyle={{
        ...containerStyle,
        padding: 0
      }}
      onPress={() => typeof onPress === 'function' && onPress(_value)}
    />
  );
};

const CheckboxField = createField({
  fieldName: 'CheckboxField',
  render: renderCustomField,
});

export default CheckboxField;