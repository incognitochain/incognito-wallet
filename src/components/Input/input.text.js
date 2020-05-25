import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseTextInput as TextInput } from '@components/core';
import PropTypes from 'prop-types';
import { BtnMax } from '@src/components/Button';
import { COLORS } from '@src/styles';
import { commonStyled as styled } from './input.styled';

const inputStyled = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: COLORS.colorGreyBold,
    borderBottomWidth: 1,
    marginRight: 30,
  },
  inputFocused: {},
  input: {
    flex: 1,
  },
});

const Input = React.forwardRef((props, ref) => {
  const {
    label,
    labelStyle,
    errorStyle,
    validated,
    containerStyled,
    showBorderBottom,
    hook,
    inputMax,
    containerInputStyle,
    ...rest
  } = props;
  const [state, setState] = React.useState({
    isFocused: false,
  });
  const { isFocused } = state;
  const onFocus = () => {
    setState({ ...state, isFocused: true });
    if (typeof rest.onFocus === 'function') {
      rest.onFocus();
    }
  };
  const onBlur = () => {
    setState({ ...state, isFocused: false });
    if (typeof rest.onBlur === 'function') {
      rest.onBlur();
    }
  };
  return (
    <View style={[styled.container, containerStyled]}>
      {!!label && (
        <Text
          style={[
            styled.label,
            isFocused ? styled.labelFocused : null,
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          inputStyled.inputContainer,
          isFocused && inputStyled.inputFocused,
          containerInputStyle && containerInputStyle,
        ]}
      >
        <TextInput
          {...rest}
          ref={ref}
          style={[inputStyled.input, rest.style ? rest.style : null]}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {inputMax.visible && <BtnMax onPress={inputMax.handleShowMax} />}
      </View>
      {validated && validated.error && (
        <Text style={[styled.error, errorStyle]}>{validated.message}</Text>
      )}
    </View>
  );
});

Input.defaultProps = {
  label: '',
  validated: {
    error: false,
    message: '',
  },
  containerStyled: {},
  showBorderBottom: true,
  labelStyle: {},
  errorStyle: {},
  hook: () => null,
  inputMax: {
    visible: false,
    handleShowMax: () => null,
  },
  containerInputStyle: null,
};

Input.propTypes = {
  label: PropTypes.string,
  validated: PropTypes.shape({
    error: PropTypes.bool,
    message: PropTypes.string,
  }),
  containerStyled: PropTypes.any,
  labelStyle: PropTypes.any,
  showBorderBottom: PropTypes.bool,
  errorStyle: PropTypes.any,
  hook: PropTypes.element,
  inputMax: PropTypes.shape({
    visible: PropTypes.bool.isRequired,
    handleShowMax: PropTypes.func.isRequired,
  }),
  containerInputStyle: PropTypes.any,
};

export default Input;
