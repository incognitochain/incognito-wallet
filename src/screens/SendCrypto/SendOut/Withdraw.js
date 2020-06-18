import { Toast, Text } from '@components/core';
import {
  createForm,
  InputMaxValueField,
  InputQRField,
  validator,
} from '@components/core/reduxForm';
import LoadingTx from '@components/LoadingTx';
import {
  CONSTANT_COMMONS,
  CONSTANT_CONFIGS,
  CONSTANT_KEYS,
} from '@src/constants';
import { ExHandler } from '@services/exception';
import convertUtil from '@utils/convert';
import memmoize from 'memoize-one';
import walletValidator from 'wallet-address-validator';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { detectToken, generateTestId } from '@utils/misc';
import {
  change,
  Field,
  formValueSelector,
  isValid,
  focus,
  reset,
} from 'redux-form';
import { MESSAGES } from '@screens/Dex/constants';
import { View } from 'react-native';
import { actionToggleModal } from '@src/components/Modal';
import { COLORS } from '@src/styles';
import { ButtonBasic } from '@src/components/Button';
import { SEND } from '@src/constants/elements';
import { feeDataSelector } from '@src/components/EstimateFee/EstimateFee.selector';
import EstimateFee, {
  formName as formEstimateFee,
} from '@components/EstimateFee/EstimateFee.input';
import debounce from 'lodash/debounce';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import format from '@src/utils/format';
import floor from 'lodash/floor';
import Receipt from '@src/components/Receipt';
import { actionFetchFeeByMax } from '@src/components/EstimateFee/EstimateFee.actions';
import style from './style';

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
      shouldBlockETHWrongAddress: false,
    };
  }

  componentDidMount = async () => {
    this.setFormValidator();
  };

  componentDidUpdate(prevProps) {
    const {
      selectedPrivacy,
      feeData: { fee, feeUnitByTokenId, minAmount, maxAmount },
    } = this.props;
    const {
      selectedPrivacy: oldSelectedPrivacy,
      feeData: {
        fee: oldFee,
        feeUnitByTokenId: oldFeeUnitByTokenId,
        minAmount: oldMinAmount,
        maxAmount: oldMaxAmount,
      },
    } = prevProps;
    if (
      selectedPrivacy?.tokenId !== oldSelectedPrivacy?.tokenId ||
      fee !== oldFee ||
      feeUnitByTokenId !== oldFeeUnitByTokenId ||
      maxAmount !== oldMaxAmount ||
      minAmount !== oldMinAmount
    ) {
      // need to re-calc min amount if token decimals was changed
      this.setFormValidator();
    }
  }

  setFormValidator = debounce(() => {
    const { selectedPrivacy, feeData } = this.props;
    const { maxAmountText, minAmountText } = feeData;
    const _maxAmount = convertUtil.toNumber(maxAmountText, true);
    const _minAmount = convertUtil.toNumber(minAmountText, true);
    if (Number.isFinite(_maxAmount)) {
      this.setState({
        maxAmountValidator: validator.maxValue(_maxAmount, {
          message:
            _maxAmount > 0
              ? `Max amount you can withdraw is ${maxAmountText} ${selectedPrivacy?.externalSymbol ||
                  selectedPrivacy?.symbol}`
              : 'Your balance is insufficient.',
        }),
      });
    }
    if (Number.isFinite(_minAmount)) {
      this.setState({
        minAmountValidator: validator.minValue(_minAmount, {
          message: `Amount must be larger than ${minAmountText} ${selectedPrivacy?.externalSymbol ||
            selectedPrivacy?.symbol}`,
        }),
      });
    }
  }, 200);

  handleSubmit = async (values) => {
    const {
      selectedPrivacy,
      feeData,
      actionToggleModal,
      rfReset,
      handleCentralizedWithdraw,
      handleDecentralizedWithdraw,
    } = this.props;
    const disabledForm = this.shouldDisabledSubmit();
    if (disabledForm) {
      return;
    }
    let res;
    try {
      const { amount, toAddress, memo } = values;
      const { fee, isUsedPRVFee, rate, feePDecimals, feeUnit } = feeData;
      const amountToNumber = convertUtil.toNumber(amount, true);
      const originalAmount = convertUtil.toOriginalAmount(
        amountToNumber,
        selectedPrivacy?.pDecimals,
        false,
      );
      const _originalAmount = floor(originalAmount);
      const originalFee = floor(fee / rate);
      const _fee = format.amountFull(originalFee * rate, feePDecimals);
      const feeForBurn = originalFee;
      const remoteAddress = toAddress;
      const payload = {
        amount,
        originalAmount: _originalAmount,
        remoteAddress,
        isUsedPRVFee,
        originalFee,
        memo,
        feeForBurn,
        feeForBurnText: _fee,
        fee: _fee,
      };
      if (selectedPrivacy?.isDecentralized) {
        res = await handleDecentralizedWithdraw(payload);
      } else {
        res = await handleCentralizedWithdraw(payload);
      }
      if (res) {
        await rfReset(formName);
        await actionToggleModal({
          visible: true,
          data: (
            <Receipt
              {...{
                ...res,
                originalAmount,
                fee: _fee,
                feeUnit,
                title: 'Sent.',
                toAddress,
                pDecimals: selectedPrivacy?.pDecimals,
                tokenSymbol:
                  selectedPrivacy?.externalSymbol || res?.tokenSymbol,
                keySaveAddressBook:
                  CONSTANT_KEYS.REDUX_STATE_RECEIVERS_OUT_NETWORK,
              }}
            />
          ),
        });
      }
    } catch (e) {
      console.log('error', e);
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
    const { shouldBlockETHWrongAddress } = this.state;
    if (shouldBlockETHWrongAddress) {
      return true;
    }
    const { isFormValid, feeData, isFormEstimateFeeValid } = this.props;
    const { fee } = feeData;
    if (!isFormValid || !fee || !isFormEstimateFeeValid) {
      return true;
    }
    return false;
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
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.NEO) {
      return validator.combinedNEOAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ZEN) {
      return validator.combinedZenAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ZCL) {
      return validator.combinedZCLAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ZEC) {
      return validator.combinedZECAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.VOT) {
      return validator.combinedVOTAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.VTC) {
      return validator.combinedVTCAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.SNG) {
      return validator.combinedSNGAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.XRB) {
      return validator.combinedXRBAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.XRP) {
      return validator.combinedXRPAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.QTUM) {
      return validator.combinedQTUMAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.PTS) {
      return validator.combinedPTSAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.PPC) {
      return validator.combinedPPCAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.GAS) {
      return validator.combinedGASAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.NMC) {
      return validator.combinedNMCAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.MEC) {
      return validator.combinedMECAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.LTC) {
      return validator.combinedLTCAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.KMD) {
      return validator.combinedKMDAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.HUSH) {
      return validator.combinedHUSHAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.GRLC) {
      return validator.combinedGRLCAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.FRC) {
      return validator.combinedFRCAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.DOGE) {
      return validator.combinedDOGEAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.DGB) {
      return validator.combinedDGBAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.DCR) {
      return validator.combinedDCRAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.CLO) {
      return validator.combinedCLOAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.BTG) {
      return validator.combinedBTGAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.BCH) {
      return validator.combinedBCHAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.BIO) {
      return validator.combinedBIOAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.BVC) {
      return validator.combinedBVCAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.BKX) {
      return validator.combinedBKXAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.AUR) {
      return validator.combinedAURAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ZIL) {
      return validator.combinedZILAddress;
    } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.XMR) {
      return validator.combinedXMRAddress;
    }
    // default
    return validator.combinedUnknownAddress;
  });

  clearAddressField = () => {
    const { rfChange } = this.props;
    rfChange('withdraw', 'toAddress', null);
    this.setState({ shouldBlockETHWrongAddress: false });
  };

  checkIfValidAddressETH = (address, isETH, isETHValid) => {
    if (isETH && isETHValid && address != '') {
      try {
        let url =
          CONSTANT_CONFIGS.API_BASE_URL +
          '/eta/is-eth-account?address=' +
          address;
        fetch(url)
          .then((response) => {
            return response.json();
          })
          .then((data) => {
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
  };

  onPressMax = async () => {
    const { actionFetchFeeByMax, rfChange, rfFocus } = this.props;
    const maxAmountText = await actionFetchFeeByMax();
    rfChange(formName, 'amount', maxAmountText);
    rfFocus(formName, 'amount');
  };

  render() {
    const { maxAmountValidator, minAmountValidator } = this.state;
    const {
      selectedPrivacy,
      isFormValid,
      amount,
      rfFocus,
      onShowFrequentReceivers,
      rfChange,
    } = this.props;
    const { externalSymbol, isErc20Token } = selectedPrivacy || {};
    const addressValidator = this.getAddressValidator(
      externalSymbol,
      isErc20Token,
    );
    let isETH =
      isErc20Token || externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ETH;
    let { shouldBlockETHWrongAddress } = this.state;
    return (
      <View style={style.container}>
        <Form>
          {({ handleSubmit, submitting }) => (
            <View>
              <Field
                onChange={(text) => {
                  rfChange(formName, 'amount', text);
                  rfFocus(formName, 'amount');
                }}
                component={InputMaxValueField}
                name="amount"
                label="Amount"
                placeholder="0.0"
                componentProps={{
                  keyboardType: 'decimal-pad',
                  onPressMax: this.onPressMax,
                }}
                validate={[
                  ...validator.combinedAmount,
                  ...(maxAmountValidator ? [maxAmountValidator] : []),
                  ...(minAmountValidator ? [minAmountValidator] : []),
                  ...(detectToken.ispNEO(selectedPrivacy?.tokenId)
                    ? [...validator.combinedNanoAmount]
                    : []),
                ]}
              />
              <Field
                component={InputQRField}
                onChange={(event, text) => {
                  this.setState({ tempAddress: text }, () => {});
                  // I wanna check text is ETH valid coin
                  let ETHValid = walletValidator.validate(text, 'ETH', 'both');
                  this.checkIfValidAddressETH(text, isETH, ETHValid);
                  rfFocus(formName, 'toAddress');
                }}
                name="toAddress"
                label="To"
                placeholder="Enter address"
                validate={addressValidator}
                onOpenAddressBook={() => {
                  // onChange will not works for now, we have to refactor after.
                  this.clearAddressField();
                  // Clear address field for a while before going to refactor.
                  onShowFrequentReceivers();
                }}
                showNavAddrBook
              />
              {(isErc20Token ||
                externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ETH) && (
                <Text
                  style={[
                    style.warning,
                    shouldBlockETHWrongAddress ? { color: COLORS.red } : {},
                  ]}
                >
                  Please withdraw to a wallet address, not a smart contract
                  address.
                </Text>
              )}
              {selectedPrivacy?.isBep2Token ||
                (selectedPrivacy?.currencyType === 4 && (
                  <View style={style.memoContainer}>
                    <Field
                      component={InputQRField}
                      name="memo"
                      label="Memo (optional)"
                      placeholder="Enter a memo"
                      style={style.input}
                      validate={memoMaxLength}
                      maxLength={125}
                      inputStyle={style.memoInput}
                    />
                    <Text style={style.memoText}>
                      * For withdrawals to wallets on exchanges (e.g. Binance,
                      etc.), enter your memo to avoid loss of funds.
                    </Text>
                  </View>
                ))}
              <EstimateFee
                amount={
                  isFormValid && !shouldBlockETHWrongAddress ? amount : null
                }
                address={
                  isFormValid && !shouldBlockETHWrongAddress
                    ? selectedPrivacy?.paymentAddress
                    : null
                }
                isFormValid={isFormValid}
                style={style.estimateFee}
              />
              <ButtonBasic
                title="Unshield"
                btnStyle={style.submitBtn}
                disabled={this.shouldDisabledSubmit()}
                onPress={handleSubmit(this.handleSubmit)}
                {...generateTestId(SEND.SUBMIT_BUTTON)}
              />
              {submitting && <LoadingTx />}
            </View>
          )}
        </Form>
      </View>
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
  feeData: PropTypes.object.isRequired,
  actionToggleModal: PropTypes.func.isRequired,
  isFormEstimateFeeValid: PropTypes.bool.isRequired,
  rfChange: PropTypes.func.isRequired,
  rfFocus: PropTypes.func.isRequired,
  rfReset: PropTypes.func.isRequired,
  onShowFrequentReceivers: PropTypes.func.isRequired,
  actionFetchFeeByMax: PropTypes.func.isRequired,
};

const mapState = (state) => ({
  amount: selector(state, 'amount'),
  toAddress: selector(state, 'toAddress'),
  isFormValid: isValid(formName)(state),
  feeData: feeDataSelector(state),
  isFormEstimateFeeValid: isValid(formEstimateFee)(state),
  selectedPrivacy: selectedPrivacySeleclor.selectedPrivacy(state),
});

const mapDispatch = {
  rfChange: change,
  rfFocus: focus,
  rfReset: reset,
  actionToggleModal,
  actionFetchFeeByMax,
};

export default connect(
  mapState,
  mapDispatch,
)(Withdraw);
