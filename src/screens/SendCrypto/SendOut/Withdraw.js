import {
  Button,
  Container,
  ScrollView,
  Toast,
  Text,
  View,
} from '@components/core';
import {
  createForm,
  InputMaxValueField,
  InputQRField,
  validator,
} from '@components/core/reduxForm';
import EstimateFee from '@components/EstimateFee';
import LoadingTx from '@components/LoadingTx';
import { CONSTANT_COMMONS, CONSTANT_EVENTS, CONSTANT_CONFIGS } from '@src/constants';
import { ExHandler } from '@services/exception';
import convertUtil from '@utils/convert';
import formatUtil from '@utils/format';
import memmoize from 'memoize-one';
import walletValidator from 'wallet-address-validator';
import PropTypes from 'prop-types';
import React from 'react';
import { isExchangeRatePToken } from '@services/wallet/RpcClientService';
import { connect } from 'react-redux';
import { detectToken } from '@utils/misc';
import { change, Field, formValueSelector, isValid } from 'redux-form';
import { logEvent } from '@services/firebase';
import accountService from '@services/wallet/accountService';
import { MESSAGES } from '@screens/Dex/constants';
import TokenSelect from '@components/TokenSelect';
import { setSelectedPrivacy } from '@src/redux/actions/selectedPrivacy';
import CurrentBalance from '@components/CurrentBalance';
import ROUTES_NAME from '@routers/routeNames';
import { RefreshControl } from 'react-native';
import Modal, { actionToggleModal } from '@src/components/Modal';
import { COLORS } from '@src/styles';
import LogManager from '@src/services/LogManager';
import style from './style';
import Receipt from './Withdraw.receipt';

export const formName = 'withdraw';
const selector = formValueSelector(formName);
const initialFormValues = {
  amount: '',
  toAddress: '',
};

const Form = createForm(formName, {
  initialValues: initialFormValues,
});

const memoMaxLength = validator.maxLength(125, {
  message: 'The memo is too long',
});

class Withdraw extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      maxAmountValidator: undefined,
      minAmountValidator: undefined,
      estimateFeeData: {},
      supportedFeeTypes: [],
      feeForBurn: 0,
      shouldBlockETHWrongAddress: false,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      estimateFeeData: { fee, feeUnitByTokenId },
    } = prevState;

    return {
      feeForBurn: fee,
      isUsedPRVFee: feeUnitByTokenId === CONSTANT_COMMONS.PRV_TOKEN_ID,
    };
  }

  componentDidMount() {
    this.setFormValidator({
      maxAmount: this.getMaxAmount(),
      minAmount: this.getMinAmount(),
    });
    this.getSupportedFeeTypes();
  }

  componentDidUpdate(prevProps, prevState) {
    const { selectedPrivacy } = this.props;
    const { selectedPrivacy: oldSelectedPrivacy } = prevProps;
    const {
      estimateFeeData: { fee, feeUnitByTokenId },
    } = this.state;
    const {
      estimateFeeData: { fee: oldFee, feeUnitByTokenId: oldFeeUnitByTokenId },
    } = prevState;

    if (selectedPrivacy?.pDecimals !== oldSelectedPrivacy?.pDecimals) {
      // need to re-calc min amount if token decimals was changed
      this.setFormValidator({ minAmount: this.getMinAmount() });
    }

    if (fee !== oldFee || feeUnitByTokenId !== oldFeeUnitByTokenId) {
      // need to re-calc max amount can be send if fee was changed
      this.setFormValidator({ maxAmount: this.getMaxAmount() });
    }

    if (oldSelectedPrivacy !== selectedPrivacy && selectedPrivacy) {
      this.setFormValidator({
        maxAmount: this.getMaxAmount(),
        minAmount: this.getMinAmount(),
      });
      this.getSupportedFeeTypes();
    }
  }

  getMinAmount = () => {
    // MIN = 1 nano
    const { selectedPrivacy, minAmount } = this.props;
    let min = 0;
    if (selectedPrivacy?.pDecimals) {
      min = 1 / 10 ** selectedPrivacy.pDecimals;
    }

    return minAmount ? Math.max(min, minAmount) : min;
  };

  getMaxAmount = () => {
    const { selectedPrivacy, maxAmount } = this.props;
    const {
      estimateFeeData: { fee },
      feeForBurn,
      isUsedPRVFee,
    } = this.state;
    let max = 0;
    let amount = selectedPrivacy?.amount;

    if (!isUsedPRVFee) {
      amount -= fee + feeForBurn || 0;
    }

    max = convertUtil.toHumanAmount(amount, selectedPrivacy?.pDecimals);

    max = maxAmount ? Math.min(maxAmount, max) : max;

    return max;
  };

  setFormValidator = ({ maxAmount, minAmount }) => {
    const { selectedPrivacy } = this.props;

    if (maxAmount) {
      this.setState({
        maxAmountValidator: validator.maxValue(maxAmount, {
          message:
            maxAmount > 0
              ? `Max amount you can withdraw is ${formatUtil.number(
                maxAmount,
              )} ${selectedPrivacy?.symbol}`
              : 'Your balance is not enough to withdraw',
        }),
      });
    }

    if (minAmount) {
      this.setState({
        minAmountValidator: validator.minValue(minAmount, {
          message: `Amount must be larger than ${formatUtil.number(
            minAmount,
          )} ${selectedPrivacy?.symbol}`,
        }),
      });
    }
  };

  handleSubmit = async values => {
    const { selectedPrivacy, actionToggleModal } = this.props;
    try {
      let res;
      const {
        estimateFeeData: { fee },
        isUsedPRVFee,
        feeForBurn,
      } = this.state;
      const {
        account,
        wallet,
        handleCentralizedWithdraw,
        handleDecentralizedWithdraw,
      } = this.props;
      const { amount, toAddress, memo } = values;
      const convertedAmount = convertUtil.toNumber(amount);
      await logEvent(CONSTANT_EVENTS.WITHDRAW, {
        tokenId: selectedPrivacy?.tokenId,
        tokenSymbol: selectedPrivacy?.symbol,
      });

      if (isUsedPRVFee) {
        const prvBalance = await accountService.getBalance(account, wallet);

        if (prvBalance < fee) {
          throw new Error(MESSAGES.NOT_ENOUGH_NETWORK_FEE);
        }
      }

      if (selectedPrivacy?.isDecentralized) {
        res = await handleDecentralizedWithdraw({
          amount: convertedAmount,
          remoteAddress: toAddress,
          fee,
          isUsedPRVFee,
          feeForBurn,
        });
      } else {
        res = await handleCentralizedWithdraw({
          amount: convertedAmount,
          remoteAddress: toAddress,
          fee,
          isUsedPRVFee,
          feeForBurn,
          memo,
        });
      }
      if (res) {
        await logEvent(CONSTANT_EVENTS.WITHDRAW_SUCCESS, {
          tokenId: selectedPrivacy?.tokenId,
          tokenSymbol: selectedPrivacy?.symbol,
        });
        await actionToggleModal({
          visible: true,
          data: (
            <Receipt
              {...{
                ...res,
                title: 'Success! You withdrew funds.',
                toAddress,
                pDecimals: selectedPrivacy?.pDecimals,
              }}
            />
          ),
        });
      }
    } catch (e) {
      await logEvent(CONSTANT_EVENTS.WITHDRAW_FAILED, {
        tokenId: selectedPrivacy?.tokenId,
        tokenSymbol: selectedPrivacy?.symbol,
      });

      if (e.message === MESSAGES.NOT_ENOUGH_NETWORK_FEE) {
        Toast.showError(e.message);
      } else {
        new ExHandler(
          e,
          'Something went wrong. Please try again.',
        ).showErrorToast(true);
      }
    }
  };

  shouldDisabledSubmit = () => {
    const {
      estimateFeeData: { fee },
    } = this.state;
    if (fee !== 0 && !fee) {
      return true;
    }

    return false;
  };

  handleSelectFee = estimateFeeData => {
    this.setState({ estimateFeeData });
  };

  getAddressValidator = memmoize((externalSymbol, isErc20Token) => {
    if (isErc20Token || externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ETH) {
      return validator.combinedETHAddress;
    }
    if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.TOMO) {
      return validator.combinedTOMOAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.BTC) {
      return validator.combinedBTCAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.BNB) {
      return validator.combinedBNBAddress;
    }

    // default
    return validator.combinedUnknownAddress;
  });

  getSupportedFeeTypes = async () => {
    const supportedFeeTypes = [
      {
        tokenId: CONSTANT_COMMONS.PRV_TOKEN_ID,
        symbol: CONSTANT_COMMONS.CRYPTO_SYMBOL.PRV,
      },
    ];

    try {
      const { selectedPrivacy } = this.props;
      const isUsed = await isExchangeRatePToken(selectedPrivacy.tokenId);
      isUsed &&
        supportedFeeTypes.push({
          tokenId: selectedPrivacy.tokenId,
          symbol: selectedPrivacy.symbol,
        });
    } catch (e) {
      new ExHandler(e);
    } finally {
      this.setState({ supportedFeeTypes });
    }
  };

  handleSelectToken = tokenId => {
    const { setSelectedPrivacy } = this.props;
    console.log(tokenId);
    setSelectedPrivacy(tokenId);
    this.setState({
      shouldBlockETHWrongAddress: false
    });
  };

  checkIfValidAddressETH = (address, isETH, isETHValid) => {
    if (isETH && isETHValid && address != '') {
      try {
        let url = CONSTANT_CONFIGS.API_BASE_URL + '/eta/is-eth-account?address=' + address;
        fetch(url)
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            console.log(LogManager.parseJsonObjectToJsonString(data));
            if (data && data.Result === false) {
              this.setState({ shouldBlockETHWrongAddress: true });
            } else {
              this.setState({ shouldBlockETHWrongAddress: false });
            }
          });
      } catch (err) {
        alert('Could not validate ETH address for now, please try again');
      }
    } else {
      this.setState({ shouldBlockETHWrongAddress: false });
    }
  }

  render() {
    const {
      maxAmountValidator,
      minAmountValidator,
      supportedFeeTypes,
      estimateFeeData,
      feeForBurn,
      isUsedPRVFee,
    } = this.state;
    const { fee, feeUnit } = estimateFeeData;
    const {
      selectedPrivacy,
      isFormValid,
      amount,
      account,
      selectable,
      onShowFrequentReceivers,
      reloading,
    } = this.props;
    const { externalSymbol, isErc20Token, name: tokenName } =
      selectedPrivacy || {};
    const addressValidator = this.getAddressValidator(
      externalSymbol,
      isErc20Token,
    );
    const maxAmount = this.getMaxAmount();
    let isETH = isErc20Token || externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ETH;
    let { shouldBlockETHWrongAddress } = this.state;
    return (
      <ScrollView
        style={style.container}
        refreshControl={(
          <RefreshControl
            refreshing={reloading}
          />
        )}
      >
        <Container style={style.mainContainer}>
          <View>
            <CurrentBalance
              select={
                selectable ? (
                  <TokenSelect onSelect={this.handleSelectToken} onlyPToken />
                ) : null
              }
            />
          </View>
          <Form style={style.form}>
            {({ handleSubmit, submitting }) => (
              <>
                <Field
                  component={InputQRField}
                  onChange={(text) => { 
                    // I wanna check text is ETH valid coin
                    let ETHValid = walletValidator.validate(text, 'ETH', 'both');
                    this.checkIfValidAddressETH(text, isETH, ETHValid); 
                  }}
                  name="toAddress"
                  label="To"
                  placeholder={`Enter your ${tokenName}  address`}
                  style={style.input}
                  validate={addressValidator}
                  onOpenAddressBook={onShowFrequentReceivers}
                  showNavAddrBook
                />
                {(isErc20Token || externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ETH) && (
                  <Text style={[style.warning, shouldBlockETHWrongAddress ? { color: COLORS.red } : {}]}>
                    Please withdraw to wallet addresses only.
                  </Text>
                )}
                <Field
                  component={InputMaxValueField}
                  name="amount"
                  label="Amount"
                  placeholder="Amount"
                  style={style.input}
                  maxValue={maxAmount}
                  componentProps={{
                    keyboardType: 'decimal-pad',
                  }}
                  validate={[
                    ...validator.combinedAmount,
                    ...maxAmountValidator ? [maxAmountValidator] : [],
                    ...minAmountValidator ? [minAmountValidator] : [],
                    ...detectToken.ispNEO(selectedPrivacy?.tokenId) ? [...validator.combinedNanoAmount] : [],
                  ]}
                />
                {detectToken.ispBNB(selectedPrivacy?.tokenId) && (
                  <View style={style.memoContainer}>
                    <Field
                      component={InputQRField}
                      name="memo"
                      label="Memo (optional)"
                      placeholder="Enter a memo (max 125 characters)"
                      style={style.input}
                      validate={memoMaxLength}
                    />
                    <Text style={style.memoText}>
                      * For withdrawals to wallets on exchanges (e.g. Binance,
                      etc.), enter your memo to avoid loss of funds.
                    </Text>
                  </View>
                )}
                <EstimateFee
                  accountName={account?.name}
                  estimateFeeData={estimateFeeData}
                  onNewFeeData={this.handleSelectFee}
                  types={supportedFeeTypes}
                  amount={isFormValid ? amount : null}
                  toAddress={
                    isFormValid ? selectedPrivacy?.paymentAddress : null
                  } // est fee on the same network, dont care which address will be send to
                  feeText={(
                    <View>
                      {fee && (
                        <Text style={style.feeText}>
                          Transaction fee:{' '}
                          {formatUtil.amountFull(
                            fee,
                            isUsedPRVFee
                              ? CONSTANT_COMMONS.DECIMALS.MAIN_CRYPTO_CURRENCY
                              : selectedPrivacy?.pDecimals,
                          )}{' '}
                          {feeUnit ? feeUnit : ''}
                        </Text>
                      )}
                      {feeForBurn && (
                        <Text style={style.feeText}>
                          Withdraw fee:{' '}
                          {formatUtil.amountFull(
                            feeForBurn,
                            isUsedPRVFee
                              ? CONSTANT_COMMONS.DECIMALS.MAIN_CRYPTO_CURRENCY
                              : selectedPrivacy?.pDecimals,
                          )}{' '}
                          {feeUnit ? feeUnit : ''}
                        </Text>
                      )}
                    </View>
                  )}
                />
                <Button
                  title="Send"
                  style={style.submitBtn}
                  disabled={this.shouldDisabledSubmit()}
                  onPress={handleSubmit(this.handleSubmit)}
                  isAsync
                  isLoading={submitting}
                />
                {submitting && <LoadingTx />}
              </>
            )}
          </Form>
          <Modal />
        </Container>
      </ScrollView>
    );
  }
}

Withdraw.defaultProps = {
  amount: null,
  isFormValid: false,
  minAmount: null,
  maxAmount: null,
  selectable: true,
  reloading: false,
};

Withdraw.propTypes = {
  handleCentralizedWithdraw: PropTypes.func.isRequired,
  handleDecentralizedWithdraw: PropTypes.func.isRequired,
  setSelectedPrivacy: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  selectedPrivacy: PropTypes.object.isRequired,
  account: PropTypes.object.isRequired,
  wallet: PropTypes.object.isRequired,
  isFormValid: PropTypes.bool,
  amount: PropTypes.string,
  minAmount: PropTypes.number,
  maxAmount: PropTypes.number,
  selectable: PropTypes.bool,
  reloading: PropTypes.bool,
};

const mapState = state => ({
  amount: selector(state, 'amount'),
  toAddress: selector(state, 'toAddress'),
  isFormValid: isValid(formName)(state),
});

const mapDispatch = {
  rfChange: change,
  setSelectedPrivacy,
  actionToggleModal,
};

export default connect(mapState, mapDispatch)(Withdraw);
