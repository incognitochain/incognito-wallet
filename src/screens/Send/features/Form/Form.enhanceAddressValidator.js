/* eslint-disable import/no-cycle */
import React from 'react';
import { useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { validator } from '@src/components/core/reduxForm';
import { CONSTANT_COMMONS } from '@src/constants';
import accountService from '@src/services/wallet/accountService';
import { selectedPrivacySelector } from '@src/redux/selectors';
import { feeDataSelector } from '@src/components/EstimateFee/EstimateFee.selector';
import { formName } from './Form.enhance';

export const enhanceAddressValidation = (WrappedComp) => (props) => {
  const selector = formValueSelector(formName);
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const {
    externalSymbol,
    isErc20Token,
    isMainCrypto,
    currencyType,
  } = selectedPrivacy;
  const toAddress = useSelector((state) => selector(state, 'toAddress'));
  const isIncognitoAddress =
    accountService.checkPaymentAddress(toAddress);
  const isExternalAddress =
    (!!toAddress && !isIncognitoAddress) && selectedPrivacy?.isWithdrawable;
  const isUnshieldPegPRV = isMainCrypto && isExternalAddress;
  const { isAddressValidated, isValidETHAddress } = useSelector(
    feeDataSelector,
  );
  const isERC20 =
    isErc20Token ||
    currencyType === CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.ETH;

  const getExternalAddressValidator = () => {
    if (!isAddressValidated) {
      return [validator.invalidAddress(`Invalid ${externalSymbol} address`)];
    }
    // if (!isValidETHAddress) {
    //   return [
    //     validator.invalidAddress(
    //       'Please withdraw to a wallet address, not a smart contract address.',
    //     ),
    //   ];
    // }
    // if (isErc20Token || externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ETH) {
    //   return validator.combinedETHAddress;
    // }
    // if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.TOMO) {
    //   return validator.combinedTOMOAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.BTC) {
    //   return validator.combinedBTCAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.BNB) {
    //   return validator.combinedBNBAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.NEO) {
    //   return validator.combinedNEOAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ZEN) {
    //   return validator.combinedZenAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ZCL) {
    //   return validator.combinedZCLAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ZEC) {
    //   return validator.combinedZECAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.VOT) {
    //   return validator.combinedVOTAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.VTC) {
    //   return validator.combinedVTCAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.SNG) {
    //   return validator.combinedSNGAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.XRB) {
    //   return validator.combinedXRBAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.XRP) {
    //   return validator.combinedXRPAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.QTUM) {
    //   return validator.combinedQTUMAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.PTS) {
    //   return validator.combinedPTSAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.PPC) {
    //   return validator.combinedPPCAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.GAS) {
    //   return validator.combinedGASAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.NMC) {
    //   return validator.combinedNMCAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.MEC) {
    //   return validator.combinedMECAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.LTC) {
    //   return validator.combinedLTCAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.KMD) {
    //   return validator.combinedKMDAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.HUSH) {
    //   return validator.combinedHUSHAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.GRLC) {
    //   return validator.combinedGRLCAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.FRC) {
    //   return validator.combinedFRCAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.DOGE) {
    //   return validator.combinedDOGEAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.DGB) {
    //   return validator.combinedDGBAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.DCR) {
    //   return validator.combinedDCRAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.CLO) {
    //   return validator.combinedCLOAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.BTG) {
    //   return validator.combinedBTGAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.BCH) {
    //   return validator.combinedBCHAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.BIO) {
    //   return validator.combinedBIOAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.BVC) {
    //   return validator.combinedBVCAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.BKX) {
    //   return validator.combinedBKXAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.AUR) {
    //   return validator.combinedAURAddress;
    // } else if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ZIL) {
    //   return validator.combinedZILAddress;
    // }

    // default
    return validator.combinedUnknownAddress;
  };

  const getAddressValidator = () => {
    if (isExternalAddress) {
      return getExternalAddressValidator();
    }
    return validator.combinedIncognitoAddress;
  };

  const getWarningAddress = () => {
    if (isExternalAddress) {
      return 'You are exiting Incognito and going public.';
    }
  };

  const validateAddress = getAddressValidator();

  const warningAddress = getWarningAddress();

  return (
    <WrappedComp
      {...{
        ...props,
        validateAddress,
        warningAddress,
        isERC20,
        isIncognitoAddress,
        isExternalAddress,
        isUnshieldPegPRV,
      }}
    />
  );
};
