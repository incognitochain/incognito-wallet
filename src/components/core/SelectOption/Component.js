/* eslint-disable */
import PropTypes from 'prop-types';
import React from 'react';
import { View, Picker, Platform, Text, TouchableOpacity, Image } from 'react-native';
import RNComponent from 'react-native-picker-select';
import ic_radio from '@src/assets/images/icons/ic_radio.png';
import ic_radio_check from '@src/assets/images/icons/ic_radio_check.png';
import { COLORS } from '@src/styles';
import styleSheet from './style';

const SelectOption = ({ containerStyle, inputStyle, labelStyle, style, prependView, label, items, onChange, value }) => {
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
        <View style={styleSheet.selectBox}>
          {items.map((item) => {
            const isSelected = item.value === value;
            return (
              <TouchableOpacity
                style={[styleSheet.optionBtn, isSelected ? styleSheet.selectedBtn : styleSheet.unSelectBtn]}
                key={item.label}
                onPress={() => onChange(item.value)}
              >
                <View style={styleSheet.optionContent}>
                  <Image style={styleSheet.icon} source={isSelected ? ic_radio_check : ic_radio} />
                  <Text style={[styleSheet.textSelectBox, { color: isSelected ? COLORS.black : COLORS.colorGreyBold }]}>{item.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        {prependView}
      </View>
    </View>
  );
};

SelectOption.defaultProps = {
  label: null,
  containerStyle: null,
  inputStyle: null,
  prependView: null,
  style: null,
  items: [{ label: 'a', value: 'a' }, { label: 'b', value: 'b' }],
  onChange: () => null,
  value: 'a'
};

SelectOption.propTypes = {
  containerStyle: PropTypes.object,
  inputStyle: PropTypes.object,
  prependView: PropTypes.element,
  label: PropTypes.string,
  style: PropTypes.shape({}),
  items: PropTypes.object,
  onChange: PropTypes.func,
  value: PropTypes.any,
};

export default SelectOption;
