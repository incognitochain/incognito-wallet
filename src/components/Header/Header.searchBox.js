import { TextInput } from '@src/components/Input';
import React from 'react';
import { StyleSheet } from 'react-native';
import { createForm } from '@components/core/reduxForm';
import { Field } from 'redux-form';
import PropTypes from 'prop-types';
import { ScreenWidth } from '@src/utils/devices';

const styled = StyleSheet.create({
  searchBox: {
    marginRight: 30,
    flex: 1,
  },
  searchBoxNormal: {
    marginRight: 20,
    width: ScreenWidth * 0.62,
    height: 30,
  }
});
export const searchBoxConfig = {
  form: 'searchFormHeader',
  searchBox: 'search',
};
const Form = createForm(searchBoxConfig.form);
const SearchBox = (props) => {
  if (props?.isNormalSearch && props?.isNormalSearch) {
    return (
      <TextInput
        style={styled.searchBoxNormal}
        containerInputStyle={styled.searchBoxNormal}
        onChangeText={props?.onChange}
        onBlur={props?.onSubmit}
        autoFocus
        placeholder={props?.placeHolder || ''}
        onSubmitEditting={props?.onSubmit}
      />
    );
  }
  return (
    <Form style={styled.searchBox}>
      <Field
        name={searchBoxConfig.searchBox}
        component={componentProps => {
          const { input, ...rest } = componentProps;
          return (
            <TextInput
              onChangeText={input?.onChange}
              onBlur={input?.onBlur}
              onFocus={input?.onFocus}
              value={input?.value}
              autoFocus
              placeholder={props?.title || ''}
              {...rest}
            />
          );
        }}
      />
    </Form>
  );
};
SearchBox.propTypes = {
  title: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
};
export default React.memo(SearchBox);