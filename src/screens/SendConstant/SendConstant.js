import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Text, Container, Form, FormTextField, FormSubmitButton, Toast, ScrollView, CheckBoxField } from '@src/components/core';
import { CONSTANT_COMMONS } from '@src/constants';
import formatUtil from '@src/utils/format';
import formValidate from './formValidate';
import styleSheet from './style';
import Account from '@src/services/wallet/accountService';
import ROUTE_NAMES from '@src/router/routeNames';
import { getEstimateFee } from '@src/services/wallet/RpcClientService';
import convert from '@src/utils/convert';

const initialFormValues = {
  isPrivacy: false,
  amount: '1',
  minFee: '0.5',
  fee: '0.5',
  fromAddress: ''
};

class SendConstant extends Component {
  constructor() {
    super();

    this.state = {
      initialFormValues,
    };

    this.handleShouldGetFee = _.debounce(::this.handleShouldGetFee, 500);

    this.form = null;
  }

  componentDidMount() {
    const { account } = this.props;

    this.setFormValue({
      ...initialFormValues,
      fromAddress: account?.PaymentAddress,
    });
  }

  setFormValue = (initialFormValues) => {
    this.setState({ initialFormValues });
  }

  updateFormValues = (field, value) => {
    if (this.form) {
      this.form.setFieldValue(field, value, true);
    }
  }

  goHome = () => {
    const { navigation } = this.props;
    navigation.navigate(ROUTE_NAMES.RootApp);
  };

  // estimate fee when user update isPrivacy or amount, and toAddress is not null
  handleEstimateFee = async (values) => {
    const { account, wallet } = this.props;

    const { fromAddress, toAddress, amount, isPrivacy } = values;

    const accountWallet = wallet.getAccountByName(account.name);
    try{
      const fee =  await getEstimateFee(fromAddress, toAddress, convert.toMiliConstant(Number(amount)), account.PrivateKey, accountWallet, isPrivacy);
      // set min fee state
      this.setState({minFee: convert.toConstant(fee)});
      // update fee
      this.updateFormValues('fee', String(convert.toConstant(fee)));
    } catch(e){
      Toast.showError('Error on get estimation fee!');
    }
  };

  handleSend = async (values) => {
    const { account, wallet } = this.props;

    const { toAddress, amount, isPrivacy, fee } = values;

    const paymentInfos = [{
      paymentAddressStr: toAddress, amount: convert.toMiliConstant(Number(amount))
    }];

    try {
      const res = await Account.sendConstant(paymentInfos, convert.toMiliConstant(Number(fee)), isPrivacy, account, wallet);

      if (res.txId) {
        Toast.showInfo(`Sent successfully. TxId: ${res.txId}`);
        this.goHome();
      } else {
        Toast.showError(`Sent failed. Please try again! Err: ${res.err.Message || res.err }`);
      }
    } catch (e) {
      Toast.showError(`Sent failed. Please try again! Err:' ${e.message}`);
    }
  };

  handleShouldGetFee = async () => {
    const { errors, values } = this.form;

    if (Object.values(errors).length){
      return;
    }

    const { amount, toAddress, isPrivacy } = values;

    if (amount && toAddress && typeof isPrivacy === 'boolean'){
      this.handleEstimateFee(values);
    }
  }

  onFormValidate = values => {
    const { account } = this.props;
    const errors = {};

    if (values.amount >= account.value) {
      errors.amount = `Must be less than ${values?.amount}`;
    }
    
    return errors;
  }

  render() {
    const { account } = this.props;
    const { initialFormValues } = this.state;

    return (
      <ScrollView>
        <Container style={styleSheet.container}>
          <Text style={styleSheet.title}>Send Constant</Text>
          <Text>
            Balance: { formatUtil.amountConstant(account.value) } {CONSTANT_COMMONS.CONST_SYMBOL}
          </Text>
          <Form
            formRef={form => this.form = form}
            initialValues={initialFormValues}
            onSubmit={this.handleSend}
            viewProps={{ style: styleSheet.form }}
            validationSchema={formValidate}
            validate={this.onFormValidate}
          >
            <FormTextField name='fromAddress' placeholder='From Address' editable={false}  />
            <CheckBoxField name='isPrivacy' label='Is Privacy' onFieldChange={this.handleShouldGetFee} />
            <FormTextField name='toAddress' placeholder='To Address' onFieldChange={this.handleShouldGetFee} />
            <FormTextField name='amount' placeholder='Amount' onFieldChange={this.handleShouldGetFee}/>
            <FormTextField name='fee' placeholder='Min Fee' />
            <FormSubmitButton title='SEND' style={styleSheet.submitBtn} />
          </Form>
          <Text style={styleSheet.noteText}>* Only send CONSTANT to a CONSTANT address.</Text>
        </Container>
      </ScrollView>
    );
  }
}

SendConstant.propTypes = {
  navigation: PropTypes.object,
  wallet: PropTypes.object,
  account: PropTypes.object,
};

export default SendConstant;