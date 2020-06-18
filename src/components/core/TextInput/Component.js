import PropTypes from 'prop-types';
import React, { useState } from 'react';
import {
  TextInput as RNComponent,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { COLORS } from '@src/styles';
import styleSheet from './style';

const TextInput = ({
  containerStyle,
  inputStyle,
  style,
  prependView,
  appendView,
  label,
  onFocus,
  onBlur,
  clearable,
  maxLength,
  onRef,
  labelStyle,
  oldVersion = false,
  canEditable,
  ...props
}) => {
  const [focus, setFocus] = useState(false);
  let textInput = React.createRef();

  React.useEffect(() => {
    if (textInput && onRef) {
      onRef(textInput);
    }
  }, [textInput]);

  function handleFocus() {
    setFocus(true);
    if (typeof onFocus === 'function') {
      onFocus.apply(this, arguments);
    }
  }

  function handleBlur() {
    setFocus(false);
    if (typeof onBlur === 'function') {
      onBlur.apply(this, arguments);
    }
  }

  function handleClear() {
    const { onChangeText } = props;
    textInput.current.clear();

    if (onChangeText) {
      onChangeText('');
    }
  }
  return (
    <View style={[styleSheet.container, style]}>
      {label && (
        <Text
          style={[
            styleSheet.label,
            oldVersion && styleSheet.labelOld,
            labelStyle,
            focus && oldVersion && styleSheet.labelFocus,
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styleSheet.row,
          oldVersion && styleSheet.rowOld,
          containerStyle,
          focus && oldVersion && styleSheet.focus,
        ]}
      >
        {appendView}
        {canEditable ? (
          <RNComponent
            ref={textInput}
            allowFontScaling={false}
            placeholderTextColor={COLORS.colorGreyBold}
            returnKeyType="done"
            maxLength={maxLength}
            style={[
              styleSheet.input,
              oldVersion && styleSheet.oldInput,
              inputStyle,
            ]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoCapitalize="none"
            spellCheck={false}
            textAlignVertical="center"
            autoCompleteType="off"
            autoCorrect={false}
            ellipsizeMode="middle"
            numberOfLines={1}
            {...props}
          />
        ) : (
          <Text
            style={styleSheet.input}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {props?.defaultValue || ''}
          </Text>
        )}

        {clearable && focus && (
          <TouchableOpacity onPress={handleClear}>
            <Icon
              name="ios-close-circle"
              type="ionicon"
              color={COLORS.lightGrey3}
              size={20}
            />
          </TouchableOpacity>
        )}
        {prependView}
      </View>
    </View>
  );
};

TextInput.defaultProps = {
  label: null,
  containerStyle: null,
  inputStyle: null,
  prependView: null,
  appendView: null,
  clearable: false,
  onChangeText: undefined,
  onFocus: undefined,
  onBlur: undefined,
  style: null,
  maxLength: null,
  labelStyle: null,
  oldVersion: false,
  onRef: null,
  canEditable: true,
};

TextInput.propTypes = {
  containerStyle: PropTypes.object,
  inputStyle: PropTypes.object,
  prependView: PropTypes.element,
  appendView: PropTypes.element,
  label: PropTypes.string,
  clearable: PropTypes.bool,
  onChangeText: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  style: PropTypes.object,
  maxLength: PropTypes.number,
  labelStyle: PropTypes.any,
  oldVersion: PropTypes.bool,
  onRef: PropTypes.func,
  canEditable: PropTypes.bool,
};

export default TextInput;
