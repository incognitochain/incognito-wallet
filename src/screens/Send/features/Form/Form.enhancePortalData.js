import React from 'react';
import { View, Text } from 'react-native';
import { ClockWiseIcon } from '@src/components/Icons';
import { ButtonBasic } from '@src/components/Button';
import { useSelector } from 'react-redux';
import convert from '@src/utils/convert';
import { feeDataSelector } from '@src/components/EstimateFee/EstimateFee.selector';
import { MAX_FEE_PER_TX } from '@src/components/EstimateFee/EstimateFee.utils';
import { selectedPrivacySelector } from '@src/redux/selectors';
import { getDefaultAccountWalletSelector } from '@src/redux/selectors/shared';
import { styledForm as styled } from './Form.styled';

// prepare data for portal: isPortalToken, minUnshieldAmount, maxUnshieldAmount, avgUnshieldPortal
export const enhancePortalData = (WrappedComp) => (props) => {
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const accountWallet = useSelector(getDefaultAccountWalletSelector);
  const { isUnShield } = useSelector(feeDataSelector);

  const [state, setState] = React.useState({
    isPortalToken: false,
    minUnshieldOriginalAmount: 0,     // nano
    maxUnshieldOriginalAmount: 0,     // nano
    minUnshieldAmount: 0, 
    maxUnshieldAmount: 0, 
    avgUnshieldFee: 0,                // nano
    incNetworkFee: MAX_FEE_PER_TX,    // nano
  });
  
  const [initSuccess, setInitSuccess] = React.useState(false);

  React.useEffect(() => {
    if (isUnShield) {
      getPortalData();
    }
  }, [isUnShield]);

  const getPortalData = async () => {
    try {
      console.log('getPortalData *******************');
      const isPortalToken = await accountWallet.handleCheckIsPortalToken({ tokenID: selectedPrivacy.tokenId });
      if ( isPortalToken ){
        // get average unshield fee
        let [avgUnshieldFee, minUnshieldOriginalAmount] = await Promise.all([
          accountWallet.handleGetAverageUnshieldFee(),
          accountWallet.handleGetPortalMinUnShieldAmount({ tokenID: selectedPrivacy.tokenId })
        ]);

        avgUnshieldFee = Number.parseInt(avgUnshieldFee);
        minUnshieldOriginalAmount = minUnshieldOriginalAmount < avgUnshieldFee ? avgUnshieldFee : minUnshieldOriginalAmount;
        const maxUnshieldOriginalAmount = selectedPrivacy?.amount;

        const minUnshieldAmount = convert.toHumanAmount(minUnshieldOriginalAmount, selectedPrivacy?.pDecimals);
        const maxUnshieldAmount = convert.toHumanAmount(maxUnshieldOriginalAmount, selectedPrivacy?.pDecimals);

        const newState = {
          ...state,
          isPortalToken,
          minUnshieldOriginalAmount,
          maxUnshieldOriginalAmount,
          minUnshieldAmount,
          maxUnshieldAmount,
          avgUnshieldFee,
        };
        console.log('getPortalData newState: ', newState);
        setState(newState);
        setInitSuccess(true);
      } 
    } catch(e) {
      console.log(e);
      setInitSuccess(false);
    }
  };

  const DetectUnshieldPortalError = React.memo(({ onRetry }) => {
    return (
      <View style={styled.errorContainer}>
        <ClockWiseIcon />
        <Text style={[styled.errorText, { marginTop: 30 }]}>
          {'We seem to have hit a snag. Simply\ntap to try again.'}
        </Text>
        <ButtonBasic
          btnStyle={styled.btnRetry}
          titleStyle={styled.titleBtnRetry}
          onPress={onRetry}
          title="Try again"
        />
        <Text style={styled.errorText}>
          {'If that doesn’t work,\n please come back in 60 minutes.'}
        </Text>
      </View>
    );
  });


  if (!initSuccess) {
    return <DetectUnshieldPortalError onRetry={getPortalData} />;
  }

  return (
    <WrappedComp
      {...{
        ...props,
        portalData: state,
      }}
    />
  );
};
