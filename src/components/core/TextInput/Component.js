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
            labelStyle,
            focus && styleSheet.labelFocus,
          ]}
        >
          {label}
        </Text>
      )}
      <View style={[styleSheet.row, containerStyle, focus && styleSheet.focus]}>
        {appendView}
        <RNComponent
          allowFontScaling={false}
          placeholderTextColor={COLORS.colorGreyBold}
          returnKeyType="done"
          maxLength={maxLength}
          style={[styleSheet.input, inputStyle]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          ref={textInput}
          {...props}
        />
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
};

export default TextInput;
