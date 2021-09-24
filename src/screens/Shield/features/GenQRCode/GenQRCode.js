import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { selectedPrivacySelector } from '@src/redux/selectors';
import { shieldDataSelector, shieldDataBscSelector } from '@screens/Shield/Shield.selector';
import QrCodeGenerate from '@src/components/QrCodeGenerate';
import PropTypes from 'prop-types';
import { CopiableTextDefault as CopiableText } from '@src/components/CopiableText';
import LoadingContainer from '@src/components/LoadingContainer';
import { ButtonBasic, BtnInfo } from '@src/components/Button';
import { ClockWiseIcon } from '@src/components/Icons';
import Tooltip from '@src/components/Tooltip/Tooltip';
import { COLORS } from '@src/styles';
import { ScrollView } from '@src/components/core';
import { isEmpty } from 'lodash';
import { useNavigation } from 'react-navigation-hooks';
import { CONSTANT_COMMONS } from '@src/constants';
import convert from '@utils/convert';
import routeNames from '@routers/routeNames';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import {
  actionGetPRVBep20FeeToShield,
} from '@screens/Shield/Shield.actions';
import ic_radio from '@src/assets/images/icons/ic_radio.png';
import ic_radio_check from '@src/assets/images/icons/ic_radio_check.png';
import { PRV_ID } from '@src/screens/DexV2/constants';
import { ExHandler } from '@src/services/exception';
import withGenQRCode from './GenQRCode.enhance';
import { styled } from './GenQRCode.styled';

const NormalText = React.memo((props) => {
  const { text, style = null, children = null } = props;
  return (
    <Text style={[styled.text, style]}>
      {text}
      {children}
    </Text>
  );
});

const ShieldError = React.memo(({ handleShield, isPortalCompatible }) => {
  return (
    <View style={styled.errorContainer}>
      <ClockWiseIcon />
      <Text style={[styled.errorText, { marginTop: 30 }]}>
        {'We seem to have hit a snag. Simply\ntap to try again.'}
      </Text>
      <ButtonBasic
        btnStyle={styled.btnRetry}
        titleStyle={styled.titleBtnRetry}
        onPress={handleShield}
        title="Try again"
      />
      {isPortalCompatible ? (
        <Text style={styled.errorText}>
          {
            'If that doesn’t work,\ncheck the bulletin board for scheduled maintenance.\n\nIf there is none,\nplease come back in an hour.'
          }
        </Text>
      ) : (
        <Text style={styled.errorText}>
          {
            'If that doesn’t work,\nplease make sure your app version is the latest.'
          }
        </Text>
      )}
    </View>
  );
});

const Extra = (props) => {
  const { address, min, expiredAt, decentralized, isPortal } = useSelector(
    shieldDataSelector,
  );
  const { selectedPrivacy, defaultFee } = props;
  const navigation = useNavigation();

  const renderMinShieldAmount = () => {
    let minComp;
    if (min) {
      minComp = (
        <>
          <NormalText text="Minimum: ">
            <Text style={[styled.boldText]}>
              {`${min} ${selectedPrivacy?.externalSymbol ||
                selectedPrivacy?.symbol}`}
            </Text>
          </NormalText>
          <NormalText
            text="Smaller amounts will not be processed."
            style={styled.smallText}
          />
        </>
      );
    }
    return minComp;
  };

  const renderMinPortalShieldAmount = () => {
    let minComp;
    const symbol = selectedPrivacy?.externalSymbol || selectedPrivacy?.symbol;
    if (min) {
      minComp = (
        <>
          <NormalText text="Minimum: ">
            <Text style={[styled.boldText]}>{`${min} ${symbol}`}</Text>
          </NormalText>
          <NormalText
            text={'Smaller amounts will be rejected\nby the network and lost.'}
            style={styled.smallText}
          />
        </>
      );
    }
    return minComp;
  };

  const renderEstimateFee = () => {
    const isNativeToken =
      selectedPrivacy?.currencyType ===
        CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.ETH ||
      selectedPrivacy?.currencyType ===
        CONSTANT_COMMONS.PRIVATE_TOKEN_CURRENCY_TYPE.BSC_BNB;
    let humanFee = convert.toNumber(
      (isNativeToken ? defaultFee?.estimateFee : defaultFee?.tokenFee) || 0,
      true,
    );
    const originalFee = convert.toOriginalAmount(
      humanFee,
      selectedPrivacy?.pDecimals,
    );
    humanFee = convert.toHumanAmount(originalFee, selectedPrivacy?.pDecimals);
    if (!humanFee) return null;
    return (
      <>
        <NormalText text="Estimated shielding fee: ">
          <Text style={[styled.boldText]}>
            {`${humanFee} ${selectedPrivacy?.externalSymbol ||
              selectedPrivacy?.symbol}`}
          </Text>
        </NormalText>
        <View style={styled.centerRaw}>
          <Text style={styled.smallText}>
            This fee will be deducted from the shielded funds.
          </Text>
          <BtnInfo
            isBlack
            style={styled.btnInfo}
            onPress={() =>
              navigation.navigate(routeNames.ShieldDecentralizeDescription)
            }
          />
        </View>
      </>
    );
  };

  const renderShieldIncAddress = () => (
    <>
      <NormalText style={styled.title}>
        {'Send to this shielding\naddress '}
        <Text style={[styled.boldText]}>once only.</Text>
      </NormalText>
      <View style={styled.qrCode}>
        <QrCodeGenerate value={address} size={175} />
      </View>
      <View style={styled.hook}>
        {!isEmpty(expiredAt) && (
          <NormalText text="Expires at: ">
            <Text style={[styled.boldText, styled.countdown]}>{expiredAt}</Text>
          </NormalText>
        )}
        {renderMinShieldAmount()}
      </View>
      <CopiableText data={address} />
      <NormalText
        text={
          'If sending from an exchange, please take\nwithdrawal times into account.'
        }
        style={{ marginTop: 30 }}
      />
      <NormalText
        text={
          'It may be more reliable to use a normal\nwallet as an intermediary.'
        }
        style={{ marginTop: 10 }}
      />
    </>
  );

  const renderShieldUserAddress = () => (
    <>
      <NormalText style={styled.title} text="Send to this shielding address" />
      <View style={styled.qrCode}>
        <QrCodeGenerate value={address} size={175} />
      </View>
      <View style={styled.hook}>{renderEstimateFee()}</View>
      <CopiableText data={address} />
      <View style={{ marginTop: 15 }}>
        <NormalText
          style={styled.text}
          text={`Send only ${selectedPrivacy?.externalSymbol ||
            selectedPrivacy?.symbol} to this shielding address.`}
        />
        <NormalText
          style={{ marginTop: 10 }}
          text={`Sending coins or tokens other than ${selectedPrivacy?.externalSymbol ||
            selectedPrivacy?.symbol} to this address may result in the loss of your deposit.`}
        />
        <NormalText
          text="Use at your own risk."
          style={[styled.smallText, { marginTop: 10 }]}
        />
      </View>
    </>
  );

  const renderShieldPortalAddress = () => (
    <>
      <NormalText style={styled.title}>
        {`Send only ${selectedPrivacy?.externalSymbol ||
          selectedPrivacy?.symbol} \nto this shielding address.`}
      </NormalText>
      <View style={styled.qrCode}>
        <QrCodeGenerate value={address} size={175} />
      </View>
      <View style={styled.hook}>{renderMinPortalShieldAmount()}</View>
      <CopiableText data={address} />
    </>
  );

  return (
    <ScrollView style={styled.scrollview}>
      <View style={styled.extra}>
        {isPortal
          ? renderShieldPortalAddress()
          : decentralized === 2 || decentralized === 3
            ? renderShieldUserAddress()
            : renderShieldIncAddress()}
      </View>
    </ScrollView>
  );
};

const Content = () => {
  return (
    <View style={styled.content}>
      <Text style={styled.textContent}>
        Make sure you have selected the right coin
      </Text>
    </View>
  );
};

const GenQRCode = (props) => {
  const {
    handleShield,
    isFetching,
    isFetchFailed,
    isPortalCompatible,
    data: shieldData,
  } = props;
  const shieldDataBsc = useSelector(
    shieldDataBscSelector,
  );
  const { address } = shieldData || {};
  const [toggle, setToggle] = React.useState(true);
  const platforms = ['ETH', 'BSC'];
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const [selectedPlatform, setPlatform] = React.useState(0);
  const [selectingPlatform, setSelectingPlatform] = React.useState(0);
  const account = useSelector(defaultAccountSelector);
  const isPRV = selectedPrivacy?.tokenId === PRV_ID;
  const [defaultFee, setDefaultFee] = React.useState({
    estimateFee: 0,
    tokenFee: 0,
  });
  const dispatch = useDispatch();
  const [ethFee, setEthFee] = React.useState({ estimateFee: 0, tokenFee: 0 });
  const [bscFee, setBscFee] = React.useState({ estimateFee: 0, tokenFee: 0 });
  const [isLoadingBsc, setIsLoadingBsc] = React.useState(false);
  if (
    (shieldData?.tokenFee || shieldData?.estimateFee) &&
    (defaultFee?.estimateFee === 0 && defaultFee?.tokenFee === 0)
  ) {
    const temp = {
      estimateFee: shieldData?.estimateFee,
      tokenFee: shieldData?.tokenFee,
    };
    setDefaultFee(temp);
    if (isPRV) {
      setEthFee(ethFee);
    }
  } else if ((shieldDataBsc?.tokenFee || shieldDataBsc?.estimateFee) &&  
  (bscFee?.estimateFee === 0 && bscFee?.tokenFee === 0) && isPRV) {
    const temp = {
      estimateFee: shieldDataBsc?.estimateFeem,
      tokenFee: shieldDataBsc?.tokenFee,
    };
    setPlatform(selectingPlatform);
    setDefaultFee(temp);
    setBscFee(temp);
    setIsLoadingBsc(false);
  }

  React.useEffect(() => {
    if (toggle) {
      const timeout = setTimeout(() => {
        setToggle(false);
      }, 3000);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [toggle]);
  const renderComponent = () => {
    if (isFetchFailed) {
      return (
        <ShieldError
          handleShield={handleShield}
          isPortalCompatible={isPortalCompatible}
        />
      );
    }
    if (isFetching || !address) {
      return <LoadingContainer />;
    }
    return (
      <>
        {isPRV && renderOptionsPRV()}
        <Extra
          {...{
            ...props,
            selectedPrivacy,
            defaultFee,
          }}
        />
      </>
    );
  };

  const handlePress = (index) => {
    if (index !== selectedPlatform && isPRV) {
      setIsLoadingBsc(true);
      if (platforms[index] === 'ETH') {
        setDefaultFee(ethFee);
        setPlatform(index);
        setIsLoadingBsc(false);
      } else if (platforms[index] === 'BSC' && (shieldDataBsc?.tokenFee || shieldDataBsc?.estimateFee)) {
        setDefaultFee(bscFee);
        setPlatform(index);
        setIsLoadingBsc(false);
      } else {
        setSelectingPlatform(index);
        try {
          dispatch(
            actionGetPRVBep20FeeToShield(
              account,
              account?.signPublicKeyEncode,
              selectedPrivacy,
            ),
          );
        } catch (e) {
          new ExHandler(e).showErrorToast();
          setIsLoadingBsc(false);
        }
      }
    }
  };

  const renderOptionsPRV = () => (
    <View style={styled.selectBox}>
      {platforms.map((item, index) => {
        const isSelected = index === selectedPlatform;
        return (
          <TouchableOpacity
            style={[
              styled.optionBtn,
              isSelected ? styled.selectedBtn : styled.unSelectBtn,
            ]}
            key={`key-${index}`}
            onPress={() => handlePress(index)}
            disabled={isLoadingBsc}
          >
            <View style={styled.optionContent}>
              <Image
                style={styled.icon}
                source={isSelected ? ic_radio_check : ic_radio}
              />
              <Text
                style={[
                  styled.textSelectBox,
                  { color: isSelected ? COLORS.black : COLORS.colorGreyBold },
                ]}
              >
                {item}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
  return (
    <View style={styled.container}>
      {toggle && (
        <Tooltip
          content={<Content />}
          containerStyle={{
            backgroundColor: COLORS.black,
            borderRadius: 11,
            paddingBottom: 0,
          }}
          triangleStyle={{
            top: -50,
            right: 5,
            borderBottomColor: COLORS.black,
            transform: [{ rotate: '0deg' }],
          }}
        />
      )}
      {renderComponent()}
    </View>
  );
};

NormalText.propTypes = {
  text: PropTypes.string.isRequired,
};

Extra.propTypes = {};

GenQRCode.propTypes = {
  hasError: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  handleShield: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  isFetchFailed: PropTypes.bool.isRequired,
  isPortalCompatible: PropTypes.bool.isRequired,
};

export default withGenQRCode(GenQRCode);
