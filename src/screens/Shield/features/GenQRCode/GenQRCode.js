import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import Header from '@src/components/Header';
import { useSelector } from 'react-redux';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import { shieldDataSelector } from '@screens/Shield/Shield.selector';
import QrCodeGenerate from '@src/components/QrCodeGenerate';
import PropTypes from 'prop-types';
import SimpleInfo from '@src/components/SimpleInfo/SimpleInfo.default';
import Icons from 'react-native-vector-icons/AntDesign';
import { Button } from '@src/components/core';
import { CopiableTextDefault as CopiableText } from '@src/components/CopiableText';
import withGenQRCode from './GenQRCode.enhance';
import { styled } from './GenQRCode.styled';
import { useCountDown } from './GenQRCode.useEffect';

const NormalText = props => {
  const { text, style = null, children = null } = props;
  return (
    <Text style={[styled.text, style]}>
      {text}
      {children}
    </Text>
  );
};

const Extra = props => {
  const { address, min } = useSelector(shieldDataSelector);
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const { hasError, handleShield } = props;
  const [remainTime] = useCountDown();
  if (hasError) {
    return (
      <SimpleInfo
        icon={<Icons name="exclamationcircleo" style={styled.errorIcon} />}
        type="success"
        text="Sorry, we can not process your deposit request right now, please try again."
        subText="If this problem still happening, please come back after 60 minutes."
        button={<Button title="Try again" onPress={handleShield} isAsync />}
      />
    );
  }
  return (
    <View style={styled.extra}>
      <NormalText style={[styled.text, styled.title]}>
        {'Send to this shielding\naddress '}
        <Text style={[styled.boldText]}>once only.</Text>
      </NormalText>
      <View style={styled.qrCode}>
        <QrCodeGenerate value={address} size={175} />
      </View>
      <View style={styled.hook}>
        <NormalText text="Expires in: ">
          <Text style={[styled.boldText, styled.countdown]}>{remainTime}</Text>
        </NormalText>
        {min && (
          <NormalText text="Minimum amount: ">
            <Text style={styled.boldText}>
              {`${min} ${selectedPrivacy?.externalSymbol ||
                selectedPrivacy?.symbol}`}
            </Text>
          </NormalText>
        )}
      </View>
      <CopiableText data={address} />
    </View>
  );
};

const GenQRCode = props => {
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  return (
    <View style={styled.container}>
      <Header
        title={`Shield ${selectedPrivacy?.externalSymbol}`}
        titleStyled={styled.titleStyled}
      />
      <ScrollView style={styled.scrollview}>
        <Extra {...props} />
      </ScrollView>
    </View>
  );
};

NormalText.propTypes = {
  text: PropTypes.string.isRequired,
};

Extra.propTypes = {
  handleShield: PropTypes.func.isRequired,
  hasError: PropTypes.bool.isRequired,
};

GenQRCode.propTypes = {
  onCopyAddress: PropTypes.func.isRequired,
  hasError: PropTypes.bool.isRequired,
};

export default withGenQRCode(GenQRCode);
