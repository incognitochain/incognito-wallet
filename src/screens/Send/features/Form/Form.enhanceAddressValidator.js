/* eslint-disable import/no-cycle */
import React from 'react';
import { useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { validator } from '@src/components/core/reduxForm';
import { CONSTANT_COMMONS } from '@src/constants';
import accountService from '@src/services/wallet/accountService';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import { useKeyboard } from '@src/components/UseEffect/useKeyboard';
import walletValidator from 'wallet-address-validator';
import { Toast } from '@src/components/core';
import { estimateFeeSelector } from '@src/components/EstimateFee/EstimateFee.selector';
import { formName } from './Form.enhance';
import { apiCheckIfValidAddressETH } from './Form.services';

export const enhanceAddressValidation = (WrappedComp) => (props) => {
  const selector = formValueSelector(formName);
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const { screen } = useSelector(estimateFeeSelector);
  const { externalSymbol, isErc20Token, isMainCrypto } = selectedPrivacy;
  const toAddress = useSelector((state) => selector(state, 'toAddress'));
  const isIncognitoAddress = accountService.checkPaymentAddress(toAddress);
  const [state, setState] = React.useState({
    shouldBlockETHWrongAddress: false,
  });
  const { shouldBlockETHWrongAddress } = state;
  const [isKeyboardVisible] = useKeyboard();
  const isERC20 =
    isErc20Token || externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.ETH;

  const getExternalAddressValidator = () => {
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
    }
    // default
    return validator.combinedUnknownAddress;
  };

  const getAddressValidator = () => {
    if (isMainCrypto || isIncognitoAddress) {
      return validator.combinedIncognitoAddress;
    }
    return getExternalAddressValidator();
  };

  const handleValidateERC20Address = async () => {
    try {
      const { data } = await apiCheckIfValidAddressETH(toAddress);
      await setState({
        ...state,
        shouldBlockETHWrongAddress: !data?.Result,
      });
    } catch (error) {
      Toast.showError(
        'Could not validate ETH address for now, please try again',
      );
      await setState({ ...state, shouldBlockETHWrongAddress: false });
    }
  };

  const handleChangeAddress = async () => {
    try {
      if (!isKeyboardVisible) {
        return;
      }
      if (screen === 'UnShield') {
        const isAddressERC20Valid = walletValidator.validate(
          toAddress,
          CONSTANT_COMMONS.CRYPTO_SYMBOL.ETH,
          'both',
        );
        if (isERC20 && isAddressERC20Valid && !!toAddress) {
          return handleValidateERC20Address();
        }
      }
    } catch (error) {
      console.debug(error);
    }
  };

  React.useEffect(() => {
    handleChangeAddress();
  }, [toAddress, isKeyboardVisible, screen]);

  const validateAddress = getAddressValidator();
  return (
    <WrappedComp
      {...{ ...props, validateAddress, shouldBlockETHWrongAddress, isERC20 }}
    />
  );
};
