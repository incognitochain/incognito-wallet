import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import {
  createForm,
  InputField,
  InputQRField,
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

const isNumber = validator.number({ message: 'Decimals must be a number' });

class AddERC20Token extends Component {
  constructor(props) {
    super(props);
  }

  handleFormChange = (values, dispatch, props, previousValues) => {
    const { onSearch } = this.props;
    const { address } = values;
    const { address: oldAddress } = previousValues;
    if (address !== oldAddress) {
      onSearch(values);
    }
  };

  processFormData = (data = {}) => {
    return {
      ...data,
      decimals: data?.decimals ? String(data.decimals) : '',
    };
  };

  render() {
    const { isSearching, onAdd, data } = this.props;
    return (
      <Form
        initialValues={data && this.processFormData(data)}
        onChange={this.handleFormChange}
        style={styles.container}
      >
        {({ handleSubmit, submitting }) => (
          <View style={styles.form}>
            <Field
              component={InputQRField}
              name="address"
              label="Address"
              placeholder="Search by ERC20 Address"
              style={styles.input}
              validate={isRequired}
              componentProps={{
                labelStyle: [styles.text, styles.boldText],
              }}
            />
            {data?.symbol ? (
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
            {data?.decimals ? (
              <Field
                component={InputField}
                name="decimals"
                label="Decimals"
                style={styles.input}
                componentProps={{
                  editable: false,
                }}
                validate={[isRequired, isNumber]}
              />
            ) : null}
            <Button
              title="Add coin"
              style={styles.submitBtn}
              onPress={handleSubmit(onAdd)}
              isAsync
              disabled={!data || isSearching || submitting}
              isLoading={isSearching || submitting}
              titleStyle={styles.submitBtnTitle}
            />
          </View>
        )}
      </Form>
    );
  }
}

AddERC20Token.defaultProps = {
  isSearching: false,
  data: {
    symbol: '',
    name: '',
    address: '',
    decimals: null,
  },
};

AddERC20Token.propTypes = {
  onAdd: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  isSearching: PropTypes.bool,
  data: PropTypes.shape({
    symbol: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    decimals: PropTypes.number.isRequired,
  }),
};

export default AddERC20Token;
