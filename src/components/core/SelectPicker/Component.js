/* eslint-disable */
import PropTypes from 'prop-types';
import React from 'react';
import { View, Picker, Platform, Text } from 'react-native';
import RNComponent from 'react-native-picker-select';

import styleSheet from './style';

const SelectPicker = ({ containerStyle, inputStyle, labelStyle, style, prependView, label, ...props }) => {
  return (
    <View style={[styleSheet.container, style]}>
      {label && (
        <View style={[styleSheet.labelContainer]}>
          <Text
            style={[
              styleSheet.label,
              labelStyle,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
      <View
        style={[
          styleSheet.row,
          containerStyle,
        ]}
      >
        <RNComponent
          {...props}
          textInputProps={styleSheet.input}
        />
        {prependView}
      </View>
    </View>
  );
};

SelectPicker.defaultProps = {
  label: null,
  containerStyle: null,
  inputStyle: null,
  prependView: null,
  style: null,
};

SelectPicker.propTypes = {
  containerStyle: PropTypes.object,
  inputStyle: PropTypes.object,
  prependView: PropTypes.element,
  label: PropTypes.string,
  style: PropTypes.shape({}),
};

export default SelectPicker;
