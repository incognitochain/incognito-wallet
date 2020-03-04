import React from 'react';
import {View, Text, TextInput} from 'react-native';
import PropTypes from 'prop-types';
import {commonStyled as styled} from './input.styled';

const Input = React.forwardRef((props, ref) => {
  const {
    label,
    labelStyle,
    validated,
    containerStyled,
    showBorderBottom,
    ...rest
  } = props;
  const [state, setState] = React.useState({
    isFocused: false,
  });
  const {isFocused} = state;
  const onFocus = () => {
    setState({...state, isFocused: true});
    if (typeof rest.onFocus === 'function') {
      rest.onFocus();
    }
  };

  const onBlur = () => {
    setState({...state, isFocused: false});
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
      <TextInput
        {...rest}
        ref={ref}
        style={[
          styled.input,
          isFocused ? styled.inputFocused : null,
          rest.style ? rest.style : null,
        ]}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {validated && validated.error && (
        <Text style={styled.error}>{validated.message}</Text>
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
};

export default Input;
