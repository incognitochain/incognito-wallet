import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import {
  createForm,
  InputField,
  validator,
} from '@src/components/core/reduxForm';
import { Button, View } from '@src/components/core';
import styles from './style';

const formName = 'addBep2Token';
const Form = createForm(formName, {
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
});
const isRequired = validator.required();

class AddBep2Token extends Component {
  constructor(props) {
    super(props);
  }

  handleFormChange = (values, dispatch, props, previousValues) => {
    const { onSearch } = this.props;
    const { originalSymbol } = values;
    const { originalSymbol: oldOriginalSymbol } = previousValues;
    if (originalSymbol?.toUpperCase() !== oldOriginalSymbol?.toUpperCase()) {
      onSearch({ ...values, originalSymbol: originalSymbol?.toUpperCase() });
    }
  };

  render() {
    const { isSearching, onAdd, data } = this.props;

    return (
      <Form
        initialValues={data}
        onChange={this.handleFormChange}
        style={styles.container}
      >
        {({ handleSubmit, submitting }) => (
          <>
            <View style={styles.fields}>
              <Field
                component={InputField}
                name="originalSymbol"
                label="Origin Symbol"
                placeholder="Search by BEP2 origin symbol"
                style={styles.input}
                validate={isRequired}
                componentProps={{
                  labelStyle: [styles.text, styles.boldText],
                }}
              />
              {data?.name ? (
                <Field
                  component={InputField}
                  name="name"
                  label="Name"
                  style={styles.input}
                  componentProps={{
                    editable: false,
                  }}
                  validate={isRequired}
                />
              ) : null}
              {data?.originalSymbol ? (
                <Field
                  component={InputField}
                  name="symbol"
                  label="Symbol"
                  style={styles.input}
                  validate={isRequired}
                  componentProps={{
                    editable: false,
                  }}
                />
              ) : null}
            </View>
            <Button
              title="Add coin"
              style={styles.submitBtn}
              onPress={handleSubmit(onAdd)}
              isAsync
              disabled={!data || isSearching || submitting}
              isLoading={isSearching || submitting}
              titleStyle={styles.submitBtnTitle}
            />
          </>
        )}
      </Form>
    );
  }
}

AddBep2Token.defaultProps = {
  isSearching: false,
  data: {
    bep2symbol: '',
    symbol: '',
    name: '',
    originalSymbol: '',
  },
};

AddBep2Token.propTypes = {
  onAdd: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  isSearching: PropTypes.bool,
  data: PropTypes.shape({
    bep2symbol: PropTypes.string.isRequired,
    symbol: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    originalSymbol: PropTypes.string.isRequired,
  }),
};

export default AddBep2Token;
