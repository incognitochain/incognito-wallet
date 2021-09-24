import React from 'react';
import { SelectOption } from '@src/components/core';
import createField from './createField';

const renderCustomField = ({ input, items, ...props }) => {
  const { onChange, value } = input;
  return <SelectOption {...props} items={items} onChange={onChange} value={value} />;
};

const SelectOptionField = createField({
  fieldName: 'SelectOptionField',
  render: renderCustomField
});


export default SelectOptionField;
