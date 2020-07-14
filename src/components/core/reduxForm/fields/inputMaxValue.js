import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { TextInput } from '@src/components/core';
import formatUtil from '@src/utils/format';
import { generateTestId } from '@utils/misc';
import { SEND } from '@src/constants/elements';
import { BtnInfinite } from '@src/components/Button';
import createField from './createField';

const styled = StyleSheet.create({
  btn: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
  },
});
const renderCustomField = ({
  input,
  meta,
  maxValue,
  disableMaxBtn,
  onPressMax = null,
  ...props
}) => {
  const { onBlur, onFocus, value, ...rest } = input;
  let inputRef;
  return (
    <TextInput
      {...{ ...props, ...rest }}
      onChangeText={t => {
        input.onChange(t);
      }}
      onBlur={onBlur}
      onFocus={onFocus}
      defaultValue={value}
      returnKeyType="done"
      onRef={ref => {
        inputRef = ref;
      }}
      prependView={disableMaxBtn ? null : (
        <BtnInfinite
          style={styled.btn}
          onPress={() => {
            if (typeof onPressMax === 'function') {
              return onPressMax();
            }
            input.onChange(
              formatUtil.numberWithNoGroupSeparator(Number(maxValue)),
            );
            inputRef?.current?.focus?.();
          }}
          {...generateTestId(SEND.MAX_BUTTON)}
        />
      )}
    />
  );
};

const InputMaxValueField = createField({
  fieldName: 'InputMaxValueField',
  render: renderCustomField,
});

renderCustomField.defaultProps = {
  maxValue: null,
  onPressMax: null,
  disableMaxBtn: false,
};

renderCustomField.propTypes = {
  input: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  maxValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onPressMax: PropTypes.func,
  disableMaxBtn: PropTypes.bool,
};

export default InputMaxValueField;
