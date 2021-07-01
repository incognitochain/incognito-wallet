import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Image } from 'react-native';
import Header from '@src/components/Header';
import { COLORS, FONT } from '@src/styles';
import PropTypes from 'prop-types';
import { RoundCornerButton } from '@components/core';
import ic_radio from '@src/assets/images/icons/ic_radio.png';
import ic_radio_check from '@src/assets/images/icons/ic_radio_check.png';
import withBridgeConnect from '@src/screens/Wallet/features/BridgeConnect/WalletConnect.enhance';
import { ExHandler } from '@services/exception';
import { compose } from 'recompose';
import {isAndroid} from '@utils/platform';

const TermOfUseShield = (props) => {
  const { onNextPress, handleConnect, onSelected, selectedTerm, handleShield } = props;
  const [isPressed, setIsPressed] = React.useState(false);
  const android = isAndroid();
  const terms = [
    'I will shield from other platform (e.g. exchange, etc)',
    'I will shield from my own wallet (e.g. Metamask, Trust Wallet, etc)'
  ];

  const handlePressNext = () => {
    if (!isPressed) {
      setIsPressed(true);
      setTimeout(
        () => {setIsPressed(false);},
        500
      );
      if (typeof onNextPress === 'function') {
        // selected shield decentralize
        if (selectedTerm === (terms.length - 1)) {
          if (typeof handleConnect === 'function') {
            ( async () =>{
              try {
                const isConnected = await handleConnect();
                if (!isConnected) {
                  new ExHandler(null, 'WalletConnect connection rejected').showErrorToast();
                  return;
                }
              } catch (e) {
                new ExHandler(e).showErrorToast();
                return;
              }
              onNextPress();
            })();
          }
        } else {
          handleShield();
          onNextPress();
        }
      }
    }
  };

  const handlePress = (index) => {
    onSelected(index);
  };

  return (
    <View style={styled.container}>
      <Header title="Term of use" />
      <ScrollView style={styled.scrollview}>
        <Text style={[styled.text, { marginBottom: 22 }]}>
          You have to deposit tokens to an address provided by Bridge. How will you complete this transaction?
        </Text>
        {terms && terms.map((item, index) => {
          return (
            <TouchableOpacity
              style={index === selectedTerm ? styled.selectedButton : styled.unSelectedButon}
              key={`key-${index}`}
              onPress={() => handlePress(index)}
            >
              <View style={styled.contentView}>
                <Image style={styled.icon} source={index === selectedTerm ? ic_radio_check : ic_radio} />
                <Text style={[styled.text, { marginRight: 20, color: index === selectedTerm ? COLORS.black : COLORS.colorGreyBold }]}>{item}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <RoundCornerButton
          style={styled.button}
          title="Next"
          disabled={isPressed || selectedTerm === undefined}
          onPress={handlePressNext}
        />
        {selectedTerm === (terms.length - 1) && android && (
          <Text style={styled.warningText}>Make sure ethereum wallet was installed on your device.</Text>
        )}
      </ScrollView>
    </View>
  );
};

TermOfUseShield.propTypes = {
  onNextPress: PropTypes.func.isRequired,
  handleConnect: PropTypes.func.isRequired,
  onSelected: PropTypes.func.isRequired,
  selectedTerm: PropTypes.array.isRequired,
  handleShield: PropTypes.func.isRequired,
};

export default compose(
  withBridgeConnect,
)(TermOfUseShield);

const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollview: {
    marginTop: 22,
  },
  text: {
    color: COLORS.colorGreyBold,
    fontFamily: FONT.NAME.specialMedium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.medium + 4,
  },
  icon: {
    marginTop: 2,
    marginRight: 8,
  },
  contentView: {
    flexDirection: 'row',
  },
  selectedButton: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 0,
    marginBottom: 16,
    backgroundColor: '#EFEFEF',
  },
  unSelectedButon: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.colorGreyLight,
    marginBottom: 16
  },
  button: {
    marginTop: 30,
    backgroundColor: COLORS.black,
  },
  warningText: {
    ...FONT.STYLE.regular,
    textAlign: 'center',
    marginTop: 40,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.medium + 4,
    color: COLORS.orange,
  },
});
