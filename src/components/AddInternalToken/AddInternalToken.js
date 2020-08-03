import {
  Text,
  Button,
  View,
  Toast,
  KeyboardAwareScrollView,
} from '@src/components/core';
import LoadingTx from '@src/components/LoadingTx';
import { Field, change, isValid, formValueSelector } from 'redux-form';
import {
  createForm,
  InputField,
  ImagePickerField,
  SwitchField,
  validator,
} from '@src/components/core/reduxForm';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withNavigation } from 'react-navigation';
import { CONSTANT_COMMONS } from '@src/constants';
import { getEstimateFeeForPToken } from '@src/services/wallet/RpcClientService';
import { addTokenInfo } from '@src/services/api/token';
import Token from '@src/services/wallet/tokenService';
import formatUtil from '@src/utils/format';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { setWallet } from '@src/redux/actions/wallet';
import { getInternalTokenList } from '@src/redux/actions/token';
import { ExHandler } from '@src/services/exception';
import ROUTES_NAME from '@routers/routeNames';
import styleSheet from './style';

const formName = 'addInternalToken';
const selector = formValueSelector(formName);
const initialValues = {
  showOwnerAddress: false,
};
const Form = createForm(formName, { initialValues });
const descriptionMaxLength = validator.maxLength(255);
const isEmail = validator.email();
const imageValidate = [
  validator.fileTypes(['jpeg', 'png']),
  validator.maxFileSize(50),
];

class AddInternalToken extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isCreatingOrSending: false,
      isGettingFee: false,
      fee: null,
    };

    this.handleShouldGetFee = _.debounce(this.handleShouldGetFee, 1000);
  }

  componentDidUpdate(prevProps) {
    const { amount: oldAmount, isFormValid: oldIsFormValid } = prevProps;
    const { isFormValid, amount } = this.props;

    if (
      (amount !== oldAmount || isFormValid !== oldIsFormValid) &&
      isFormValid
    ) {
      this.handleShouldGetFee();
    }
  }

  updateFormValues = (field, value) => {
    const { rfChange } = this.props;
    if (typeof rfChange === 'function') {
      rfChange(formName, field, value);
    }
  };

  goBack = () => {
    const { navigation } = this.props;
    navigation?.navigate(ROUTES_NAME.Home);
  };

  handleSaveCoinInfo = async (data) => {
    try {
      return await addTokenInfo(data);
    } catch (e) {
      new ExHandler(
        e,
        'Your coin logo has been not saved yet, but you can update it again in Coin Detail screen.',
      ).showWarningToast();
    }
  };

  // estimate fee when user update isPrivacy or amount, and toAddress is not null
  handleEstimateFee = async (values) => {
    const { account, wallet } = this.props;

    const { fromAddress, toAddress, name, symbol, amount } = values;

    const tokenObject = {
      Privacy: true,
      TokenID: '',
      TokenName: name,
      TokenSymbol: symbol,
      TokenTxType: CONSTANT_COMMONS.TOKEN_TX_TYPE.INIT,
      TokenAmount: Number(amount),
      TokenReceivers: {
        PaymentAddress: toAddress,
        Amount: Number(amount),
      },
    };

    const accountWallet = wallet.getAccountByName(account.name);
    try {
      this.setState({ isGettingFee: true });
      const fee = await getEstimateFeeForPToken(
        fromAddress,
        toAddress,
        Number(amount),
        tokenObject,
        accountWallet,
      );

      // update fee
      this.setState({ fee: Number(fee * 2) || 50 });
    } catch (e) {
      new ExHandler(e).showErrorToast(true);
    } finally {
      this.setState({ isGettingFee: false });
    }
  };

  handleCreateSendToken = async (values) => {
    const { account, wallet, setWallet, getInternalTokenList } = this.props;

    const {
      name,
      symbol,
      amount,
      logo,
      showOwnerAddress,
      description,
      ownerName,
      ownerEmail,
      ownerWebsite,
    } = values;
    const { fee } = this.state;
    const parseAmount = Number(amount);

    const tokenObject = {
      Privacy: true,
      TokenID: '',
      TokenName: name,
      TokenSymbol: symbol,
      TokenTxType: CONSTANT_COMMONS.TOKEN_TX_TYPE.INIT,
      TokenAmount: parseAmount,
      TokenReceivers: [
        {
          PaymentAddress: account?.PaymentAddress,
          Amount: parseAmount,
        },
      ],
    };

    try {
      this.setState({ isCreatingOrSending: true });
      const res = await Token.createSendPToken(
        tokenObject,
        Number(fee) || 0,
        account,
        wallet,
      );
      if (res.txId) {
        const { tokenID, tokenName, tokenSymbol } = res;
        Toast.showSuccess('Create coin successfully');

        await this.handleSaveCoinInfo({
          tokenId: tokenID,
          name: tokenName,
          symbol: tokenSymbol,
          logoFile: logo,
          ownerAddress: account?.PaymentAddress,
          showOwnerAddress,
          description,
          ownerName,
          ownerEmail,
          ownerWebsite,
          txId: res.txId,
          amount: parseAmount,
        }).catch(() => {
          // err is no matter, the user can update their token info later in Coin Detail screen
          // so just let them pass this process
        });

        // refetch internal token list
        getInternalTokenList().catch(null);

        // update new wallet to store
        setWallet(wallet);

        this.goBack();
      } else {
        throw new Error('Something went wrong. Please refresh the screen.');
      }
    } catch (e) {
      new ExHandler(e).showErrorToast(true);
    } finally {
      this.setState({ isCreatingOrSending: false });
    }
  };

  handleShouldGetFee = async () => {
    const { account, isFormValid, name, symbol, amount } = this.props;
    const { PaymentAddress: paymentAddress } = account;

    if (!isFormValid || !paymentAddress) {
      return;
    }

    if (amount && paymentAddress && name && symbol) {
      this.handleEstimateFee({
        name,
        symbol,
        amount,
        toAddress: paymentAddress,
        fromAddress: paymentAddress,
      });
    }
  };

  renderBalance = () => {
    const { account } = this.props;

    return (
      <Text style={styleSheet.balance}>
        {` Balance: ${formatUtil.amount(
          account.value,
          CONSTANT_COMMONS.DECIMALS.MAIN_CRYPTO_CURRENCY,
        )} ${CONSTANT_COMMONS.CRYPTO_SYMBOL.PRV}`}
      </Text>
    );
  };

  render() {
    const { isCreatingOrSending, isGettingFee, fee } = this.state;
    const { account } = this.props;
    const isNotEnoughFee = account?.value < fee;
    const isCanSubmit =
      !isGettingFee && typeof fee === 'number' && !isNotEnoughFee;
    const disabled = !isCanSubmit;
    return (
      <KeyboardAwareScrollView>
        <Form>
          {({ handleSubmit, submitting }) => (
            <View style={styleSheet.container}>
              <View style={styleSheet.fields}>
                <View style={[styleSheet.block, { marginTop: 0 }]}>
                  <Field
                    component={InputField}
                    name="name"
                    placeholder="Enter coin name"
                    label="Name"
                    validate={validator.combinedTokenName}
                    inputStyle={styleSheet.input}
                    labelStyle={styleSheet.labelInput}
                    style={{
                      marginTop: 0,
                    }}
                  />
                  <Field
                    component={InputField}
                    componentProps={{ autoCapitalize: 'characters' }}
                    name="symbol"
                    placeholder="Enter coin ticker"
                    label="Ticker"
                    inputStyle={styleSheet.input}
                    validate={validator.combinedTokenSymbol}
                    labelStyle={styleSheet.labelInput}
                  />
                  <Field
                    component={InputField}
                    name="amount"
                    placeholder="Enter number of coins"
                    label="Total supply"
                    inputStyle={styleSheet.input}
                    componentProps={{
                      keyboardType: 'decimal-pad',
                    }}
                    validate={[...validator.combinedNanoAmount]}
                    labelStyle={styleSheet.labelInput}
                  />
                  <Field
                    component={InputField}
                    name="description"
                    label="Description"
                    validate={descriptionMaxLength}
                    inputStyle={styleSheet.input}
                    labelStyle={styleSheet.labelInput}
                    placeholder="Describe your coin"
                    maxLength={255}
                  />
                  <View style={styleSheet.verifyInfoContainer}>
                    <Text style={styleSheet.verifyInfoLabel}>
                      Fill in the fields below to earn a verified badge
                      (optional):
                    </Text>
                    <Field
                      component={InputField}
                      name="ownerName"
                      placeholder="Enter creator name"
                      label="Creator"
                      maxLength={100}
                      inputStyle={styleSheet.input}
                      labelStyle={styleSheet.labelInput}
                    />
                    <Field
                      component={InputField}
                      name="ownerWebsite"
                      componentProps={{
                        autoCapitalize: 'none',
                      }}
                      maxLength={100}
                      placeholder="Enter project or coin URL"
                      label="Website"
                      inputStyle={styleSheet.input}
                      labelStyle={styleSheet.labelInput}
                    />
                    <Field
                      component={InputField}
                      name="ownerEmail"
                      componentProps={{
                        keyboardType: 'email-address',
                        autoCapitalize: 'none',
                      }}
                      maxLength={100}
                      placeholder="Enter project email address"
                      label="Email address"
                      inputStyle={styleSheet.input}
                      labelStyle={styleSheet.labelInput}
                      validate={isEmail}
                    />
                  </View>
                </View>
                <View
                  style={[
                    styleSheet.block,
                    {
                      marginTop: 20,
                    },
                  ]}
                >
                  <View style={styleSheet.showMyAddressContainer}>
                    <Text style={styleSheet.showMyAddressLabel}>
                      {'Display my\nIncognito Address'}
                    </Text>
                    <Field
                      component={SwitchField}
                      name="showOwnerAddress"
                      style={[styleSheet.input, styleSheet.switch]}
                    />
                  </View>
                </View>
                <View style={styleSheet.block}>
                  <Field
                    component={ImagePickerField}
                    name="logo"
                    text="PNG format, < 50kb"
                    textButton="Upload"
                    style={styleSheet.input}
                    validate={imageValidate}
                    label="Coin icon"
                  />
                </View>
                {isGettingFee ? (
                  <Text>Calculating fee...</Text>
                ) : (
                  typeof fee === 'number' && (
                    <Text style={isNotEnoughFee && styleSheet.error}>
                      Issuance fee:{' '}
                      {formatUtil.amountFull(
                        fee,
                        CONSTANT_COMMONS.DECIMALS.MAIN_CRYPTO_CURRENCY,
                      )}{' '}
                      {CONSTANT_COMMONS.CRYPTO_SYMBOL.PRV}
                      {isNotEnoughFee &&
                        ' (please top up your balance to cover the fee)'}
                    </Text>
                  )
                )}
              </View>
              <Button
                disabled={disabled}
                title={isGettingFee ? 'Calculating fee...' : 'Mint'}
                style={[
                  styleSheet.submitBtn,
                  disabled && styleSheet.submitBtnDisabed,
                ]}
                titleStyle={styleSheet.titleSubmitBtn}
                onPress={handleSubmit(this.handleCreateSendToken)}
                isAsync
                isLoading={isGettingFee || submitting}
              />
            </View>
          )}
        </Form>
        {isCreatingOrSending && <LoadingTx />}
      </KeyboardAwareScrollView>
    );
  }
}

AddInternalToken.defaultProps = {
  isFormValid: false,
  name: null,
  symbol: null,
  amount: null,
};

AddInternalToken.propTypes = {
  navigation: PropTypes.object.isRequired,
  wallet: PropTypes.object.isRequired,
  account: PropTypes.object.isRequired,
  rfChange: PropTypes.func.isRequired,
  setWallet: PropTypes.func.isRequired,
  isFormValid: PropTypes.bool,
  name: PropTypes.string,
  symbol: PropTypes.string,
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  getInternalTokenList: PropTypes.func.isRequired,
};

const mapDispatch = {
  rfChange: change,
  setWallet,
  getInternalTokenList,
};

const mapState = (state) => ({
  amount: selector(state, 'amount'),
  name: selector(state, 'name'),
  symbol: selector(state, 'symbol'),
  isFormValid: isValid(formName)(state),
});

export default compose(
  connect(
    mapState,
    mapDispatch,
  ),
  withNavigation,
)(AddInternalToken);
