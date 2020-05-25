import { TextInput } from '@src/components/Input';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FONT, COLORS } from '@src/styles';
import { createForm } from '@components/core/reduxForm';
import { Field } from 'redux-form';
import PropTypes from 'prop-types';

const styled = StyleSheet.create({
  searchBox: {
    width: '100%',
  },
  containerInputStyle: {
    marginRight: 30,
    paddingBottom: 5,
  },
  input: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
    color: COLORS.black,
  },
});

export const searchBoxConfig = {
  form: 'searchFormHeader',
  searchBox: 'search',
};

const Form = createForm(searchBoxConfig.form);

const SearchInput = props => {
  const { input, ...rest } = props;
  return (
    <TextInput
      onChangeText={input?.onChange}
      onBlur={input?.onBlur}
      onFocus={input?.onFocus}
      value={input?.value}
      style={styled.input}
      autoFocus
      containerInputStyle={styled.containerInputStyle}
      {...rest}
    />
  );
};

const SearchBox = () => {
  return (
    <View style={styled.searchBox}>
      <Form>
        <Field
          name={searchBoxConfig.searchBox}
          component={props => {
            const { input, ...rest } = props;
            return (
              <TextInput
                onChangeText={input?.onChange}
                onBlur={input?.onBlur}
                onFocus={input?.onFocus}
                value={input?.value}
                style={styled.input}
                autoFocus
                containerInputStyle={styled.containerInputStyle}
                {...rest}
              />
            );
          }}
        />
      </Form>
    </View>
  );
};

SearchInput.props = {
  input: PropTypes.any.isRequired,
};

SearchBox.propTypes = {};

export default React.memo(SearchBox);
