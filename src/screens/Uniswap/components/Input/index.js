import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { View, Text, ActivityIndicator } from '@src/components/core';
import {TextInput, TouchableOpacity, VirtualizedList} from 'react-native';
import { Icon, Overlay } from 'react-native-elements';
import CryptoIcon from '@components/CryptoIcon';
import {COLORS} from '@src/styles';
import formatUtil from '@utils/format';
import VerifiedText from '@components/VerifiedText/index';
import {modalStyle, mainStyle, inputStyle} from '../../style';
import stylesheet from './style';

class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDialog: false,
      filteredTokens: props.tokenList || [],
    };

    this.renderTokenItem = this.renderTokenItem.bind(this);
  }

  componentDidMount() {
    this.handleSearch('');
  }

  componentDidUpdate(prevProps) {
    const { tokenList } = this.props;
    if (tokenList !== prevProps.tokenList && tokenList && tokenList.length > 0) {
      this.handleSearch('');
    }
  }

  showDialog = () => {
    this.setState({
      showDialog: true,
    }, this.getBalances);
  };

  closeDialog = () => {
    this.setState({ showDialog: false });
    this.handleSearch('');
  };

  selectToken = (token) => {
    const { onSelectToken } = this.props;
    this.closeDialog();
    onSelectToken(token);
  };

  handleSearch = (text) => {
    const { tokenList } = this.props;
    const searchText = text.toLowerCase();
    const filteredTokens = _.trim(searchText).length > 0 ? (tokenList || []) : tokenList;
    this.setState({ filteredTokens });
  };

  clearInput = () => {
    const { onChange } = this.props;
    onChange('');
  };

  renderTokenItem({ item, index }) {
    const { filteredTokens } = this.state;
    return (
      <TouchableOpacity
        key={item.id}
        style={[modalStyle.token, index === filteredTokens.length - 1 && modalStyle.lastItem]}
        onPress={() => this.selectToken(item)}
      >
        <CryptoIcon
          tokenId={item.id}
          size={25}
        />
        <View style={[mainStyle.twoColumns, mainStyle.flex]}>
          <View style={modalStyle.tokenInfo}>
            <Text style={modalStyle.tokenSymbol}>{item.symbol}</Text>
            <Text style={modalStyle.tokenName}>{item.name}</Text>
          </View>
          <Text style={[modalStyle.tokenSymbol, mainStyle.textRight]}>
            {_.castArray(item.protocol).join(', ')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  renderDialog() {
    const { showDialog, filteredTokens } = this.state;
    return (
      <Overlay isVisible={showDialog} overlayStyle={modalStyle.dialog} onBackdropPress={this.closeDialog}>
        <View>
          <View style={modalStyle.header}>
            <Text>Select coin</Text>
            <TouchableOpacity style={modalStyle.closeButton} onPress={this.closeDialog}>
              <Icon name="close" size={20} />
            </TouchableOpacity>
          </View>
          <View>
            <TextInput
              autoCorrect={false}
              placeholder="Search"
              style={modalStyle.search}
              placeholderTextColor={COLORS.lightGrey1}
              onChangeText={this.handleSearch}
            />
          </View>
          <VirtualizedList
            data={filteredTokens}
            renderItem={this.renderTokenItem}
            getItem={(data, index) => data[index]}
            getItemCount={data => data.length}
            style={modalStyle.container}
          />
        </View>
      </Overlay>
    );
  }

  renderToken() {
    const { token } = this.props;
    // Put token id to key of CryptoIcon to load new token image
    return (
      <View style={stylesheet.token}>
        <CryptoIcon
          key={token.id}
          tokenId={token.id}
          size={20}
        />
        <VerifiedText text={token.symbol} style={modalStyle.tokenInfo} isVerified={token.isVerified} />
      </View>
    );
  }

  renderSelectButton() {
    return (
      <Text>Select a token</Text>
    );
  }

  renderBalance() {
    const { balance, token } = this.props;
    return (
      <View style={[inputStyle.headerBalance, mainStyle.textRight]}>
        <Text style={[inputStyle.headerTitle, inputStyle.headerBalanceTitle]}>Balance:</Text>
        {balance === 'Loading' ?
          <View><ActivityIndicator size="small" /></View> : (
            <Text style={inputStyle.balanceText} numberOfLines={1}>
              {formatUtil.amount(balance, token?.pDecimals)}
            </Text>
          )}
      </View>
    );
  }

  renderInput() {
    const { value, onChange, disabled } = this.props;
    return (
      <View style={stylesheet.inputContainer}>
        <TextInput
          keyboardType="decimal-pad"
          style={stylesheet.input}
          placeholder={onChange ? '0.0' : ''}
          placeholderTextColor={COLORS.lightGrey1}
          value={value}
          onChangeText={onChange}
          onFocus={this.focus}
          onBlur={this.blur}
          editable={!disabled}
        />
        {_.toString(value).length > 5 && (
          <View style={stylesheet.clearIconWrapper}>
            <TouchableOpacity style={stylesheet.clearIcon} onPress={this.clearInput}>
              <Icon
                name="cancel"
                color={COLORS.lightGrey1}
                size={18}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  renderText() {
    const { value } = this.props;
    return (
      <Text numberOfLines={1} style={[stylesheet.input, { marginLeft: 0 }]}>
        {value}
      </Text>
    );
  }

  render() {
    const { token, onChange, tokenList, headerTitle, disabled } = this.props;
    return (
      <View style={stylesheet.wrapper}>
        <View style={stylesheet.header}>
          <Text style={stylesheet.headerTitle}>{headerTitle}</Text>
          {!!onChange && this.renderBalance()}
        </View>
        <View style={stylesheet.content}>
          {onChange ? this.renderInput() : this.renderText()}
          <TouchableOpacity
            onPress={this.showDialog}
            style={stylesheet.select}
            disabled={tokenList.length <= 0 || disabled}
          >
            {token ? this.renderToken() : this.renderSelectButton()}
          </TouchableOpacity>
        </View>
        {this.renderDialog()}
      </View>
    );
  }
}

Input.defaultProps = {
  token: null,
  value: undefined,
  onChange: undefined,
  balance: 0,
  disabled: false,
};

Input.propTypes = {
  token: PropTypes.object,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  headerTitle: PropTypes.string.isRequired,
  tokenList: PropTypes.array.isRequired,
  onSelectToken: PropTypes.func.isRequired,
  balance: PropTypes.number,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

export default Input;
