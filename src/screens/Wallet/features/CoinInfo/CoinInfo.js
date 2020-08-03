import React from 'react';
import { View, Text, Clipboard } from 'react-native';
import Header from '@src/components/Header';
import { ScrollView, TouchableOpacity, Toast } from '@src/components/core';
import LinkingService from '@src/services/linking';
import { CopyIcon, OpenUrlIcon } from '@src/components/Icons';
import PropTypes from 'prop-types';
import { COLORS } from '@src/styles';
import { TokenBasic } from '@src/components/Token';
import { BtnInfo } from '@src/components/Button';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import withCoinInfo from './CoinInfo.enhance';
import { styled } from './CoinInfo.styled';

const InfoItem = ({ label, value, copyable, link, onlyLabel, labelStyle }) => {
  const renderComponent = (numberOfLinesValue) => (
    <View style={styled.infoContainer}>
      {!!label && (
        <Text
          numberOfLines={1}
          ellipsizeMode="middle"
          style={[styled.label, labelStyle]}
        >
          {label}
        </Text>
      )}
      {!!value && (
        <Text
          numberOfLines={numberOfLinesValue || 1}
          ellipsizeMode="middle"
          style={styled.value}
        >
          {value}
        </Text>
      )}
      {copyable && <CopyIcon />}
      {!!link && <OpenUrlIcon />}
    </View>
  );
  const handleCopyText = () => {
    Clipboard.setString(value);
    Toast.showInfo('Copied');
  };

  const handleOpenUrl = () => LinkingService.openUrl(link);
  if (!value && !onlyLabel) {
    return null;
  }
  if (copyable) {
    return (
      <TouchableOpacity onPress={handleCopyText}>
        {renderComponent()}
      </TouchableOpacity>
    );
  }
  if (link) {
    return (
      <TouchableOpacity onPress={handleOpenUrl}>
        {renderComponent()}
      </TouchableOpacity>
    );
  }
  return renderComponent(2);
};

const CoinInfo = (props) => {
  const {
    infosFactories,
    tokenId,
    isVerified,
    handlePressVerifiedInfo,
  } = props;
  const navigation = useNavigation();
  const onGoBack = () => navigation.navigate(routeNames.WalletDetail);
  return (
    <View style={styled.container}>
      <Header
        title="Coin info"
        titleStyled={styled.headerTitleStyle}
        onGoBack={onGoBack}
      />
      <View style={styled.wrapper}>
        <ScrollView>
          <TokenBasic
            tokenId={tokenId}
            style={styled.token}
            styledContainerName={{
              maxWidth: '100%',
            }}
            styledName={{
              maxWidth: '100%',
            }}
            styledSymbol={{
              maxWidth: '100%',
            }}
          />
          <View style={styled.infoContainer}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styled.label,
                styled.labelIsVerified,
                isVerified ? { color: COLORS.green } : { color: COLORS.orange },
              ]}
            >
              {isVerified ? 'Verified' : 'Unverified'}
            </Text>
            <BtnInfo style={styled.btnInfo} onPress={handlePressVerifiedInfo} />
          </View>
          {infosFactories.map((info, key) => (
            <InfoItem {...info} key={key} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

CoinInfo.propTypes = {
  info: PropTypes.object,
  handlePressVerifiedInfo: PropTypes.func.isRequired,
  infosFactories: PropTypes.array.isRequired,
  tokenId: PropTypes.string.isRequired,
  isVerified: PropTypes.bool.isRequired,
};

CoinInfo.defaultProps = {
  info: null,
};

InfoItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  copyable: PropTypes.bool,
  link: PropTypes.string,
  labelStyle: PropTypes.any,
  onlyLabel: PropTypes.bool,
};

InfoItem.defaultProps = {
  label: '',
  value: '',
  link: '',
  labelStyle: null,
  copyable: false,
  onlyLabel: false,
};

export default withCoinInfo(CoinInfo);
