import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Button,
  BaseTextInput as TextInput,
} from '@src/components/core';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Icon, Overlay } from 'react-native-elements';
import CryptoIcon from '@components/CryptoIcon';
import {COLORS} from '@src/styles';
import formatUtil from '@utils/format';
import { MESSAGES } from '@screens/Dex/constants';
import VerifiedText from '@components/VerifiedText/index';
import {modalStyle, mainStyle, inputStyle} from '../../style';
import stylesheet from './style';

class ShareInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDialog: false,
    };
  }

  showDialog = () => {
    this.setState({
      showDialog: true,
    }, this.getBalances);
  };

  closeDialog = () => {
    this.setState({ showDialog: false });
  };

  selectPair = (pair) => {
    const { onSelectPair } = this.props;
    this.closeDialog();
    onSelectPair(pair);
  };

  setMax = () => {
    const { onChange, pair } = this.props;
    onChange(pair.share.toString());
  };

  renderDialog() {
    const { pairs } = this.props;
    const { showDialog } = this.state;
    return (
      <Overlay isVisible={showDialog} overlayStyle={modalStyle.dialog} onBackdropPress={this.closeDialog}>
        <View>
          <View style={modalStyle.header}>
            <Text>Select pair</Text>
            <TouchableOpacity style={modalStyle.closeButton} onPress={this.closeDialog}>
              <Icon name="close" size={20} />
            </TouchableOpacity>
          </View>
          <ScrollView style={modalStyle.container}>
            <View>
              {pairs?.map((item, index) =>(
                <TouchableOpacity
                  key={item.shareKey}
                  style={[modalStyle.token, index === pairs.length - 1 && modalStyle.lastItem]}
                  onPress={() => this.selectPair(item)}
                >
                  <View style={modalStyle.tokenInfo}>
                    <View style={mainStyle.twoColumns}>
                      <View style={mainStyle.tokenIcon}>
                        <CryptoIcon
                          key={item.token1.id}
                          tokenId={item.token1.id}
                          size={22}
                        />
                      </View>
                      <VerifiedText
                        isVerified={item.token1.isVerified}
                        style={modalStyle.tokenSymbol}
                        text={`${item.token1.name} (${item.token1?.symbol})`}
                      />
                    </View>
                    <View style={mainStyle.twoColumns}>
                      <View style={mainStyle.tokenIcon}>
                        <CryptoIcon
                          key={item.token2?.id}
                          tokenId={item.token2?.id}
                          size={22}
                        />
                      </View>
                      <VerifiedText
                        isVerified={item.token2?.isVerified}
                        style={modalStyle.tokenSymbol}
                        text={`${item.token2?.name} (${item.token2?.symbol})`}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Overlay>
    );
  }

  renderToken() {
    const { pair } = this.props;

    if (!pair || !pair.token1 || !pair.token2) {
      return;
    }

    return (
      <View style={stylesheet.pair}>
        <View style={stylesheet.token}>
          <CryptoIcon
            key={pair.token1.id}
            tokenId={pair.token1.id}
            size={22}
          />
          <Text style={modalStyle.tokenInfo}>{pair.token1?.symbol}</Text>
        </View>
        <View style={stylesheet.token}>
          <CryptoIcon
            key={pair.token2.id}
            tokenId={pair.token2.id}
            size={22}
          />
          <Text style={modalStyle.tokenInfo}>{pair.token2?.symbol}</Text>
        </View>
      </View>
    );
  }

  renderSelectButton() {
    return (
      <Text>Select a pair</Text>
    );
  }

  renderBalance() {
    const { pair } = this.props;

    if (!pair) {
      return;
    }

    return (
      <View style={[inputStyle.headerBalance, mainStyle.textRight]}>
        <Text style={[inputStyle.headerTitle, inputStyle.headerBalanceTitle]}>Your share:</Text>
        <Text style={inputStyle.balanceText} numberOfLines={1}>
          {formatUtil.amount(pair.share)}
        </Text>
      </View>
    );
  }

  renderShareInput() {
    const { value, onChange, disabled, pair } = this.props;
    return (
      <View style={stylesheet.inputContainer}>
        <TextInput
          keyboardType="decimal-pad"
          style={stylesheet.input}
          placeholder={onChange ? '0' : ''}
          value={value}
          onChangeText={onChange}
          editable={!disabled}
        />
        {!!pair && (
          <View style={stylesheet.maxButtonWrapper}>
            <Button
              title="Max"
              titleStyle={stylesheet.maxButtonTitle}
              style={stylesheet.maxButton}
              onPress={this.setMax}
            />
          </View>
        )}
      </View>
    );
  }

  render() {
    const { pair, headerTitle, disabled, pairs } = this.props;

    if (pairs.length <= 0 || !pairs) {
      return <Text>{MESSAGES.NO_PAIR}</Text>;
    }

    return (
      <View style={stylesheet.wrapper}>
        <View style={stylesheet.header}>
          <Text style={stylesheet.headerTitle}>{headerTitle}</Text>
          {this.renderBalance()}
        </View>
        <View style={stylesheet.content}>
          {this.renderShareInput()}
          <TouchableOpacity
            onPress={this.showDialog}
            style={stylesheet.select}
            disabled={pairs?.length <= 0 || disabled}
          >
            {pair ? this.renderToken() : this.renderSelectButton()}
          </TouchableOpacity>
        </View>
        {this.renderDialog()}
      </View>
    );
  }
}

ShareInput.defaultProps = {
  pair: null,
  value: undefined,
  onChange: undefined,
  disabled: false,
};

ShareInput.propTypes = {
  pair: PropTypes.object,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  headerTitle: PropTypes.string.isRequired,
  pairs: PropTypes.array.isRequired,
  onSelectPair: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

export default ShareInput;
