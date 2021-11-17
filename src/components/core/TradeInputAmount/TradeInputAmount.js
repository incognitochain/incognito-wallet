import React from 'react';
import {MaxIcon} from '@src/components/Icons';
import PropTypes from 'prop-types';
import Row from '@src/components/Row';
import { StyleSheet } from 'react-native';
import {
  Text,
  BaseTextInput,
  TouchableOpacity,
  ActivityIndicator,
  View,
} from '@src/components/core';
import { COLORS, FONT } from '@src/styles';
import { Icon } from '@src/components/Token/Token.shared';
import { ArrowRight } from '@components/Icons/icon.arrowRightGreyIcon';

const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flex: 1,
    height: 30,
    borderRadius: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    color: COLORS.black,
    fontSize: FONT.SIZE.large + 2,
    lineHeight: FONT.SIZE.large + 5,
    fontFamily: FONT.NAME.medium,
    marginRight: 15,
  },
  symbol: {
    color: COLORS.black,
    fontSize: FONT.SIZE.large + 2,
    lineHeight: FONT.SIZE.large + 5,
    fontFamily: FONT.NAME.medium,
    marginRight: 5,
  },
  infinityIcon: {
  },
  loadingIcon: {
    marginRight: 8,
  },
  header: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: COLORS.lightGrey36,
    fontSize: FONT.SIZE.small,
    fontFamily: FONT.NAME.regular,
  },
});

const TradeInputAmount = (props) => {
  const {
    hasInfinityIcon = false,
    onPressInfinityIcon,
    symbol,
    canSelectSymbol,
    onPressSymbol,
    placeholder = '0',
    loadingBalance,
    editableInput,
    hasIcon = false,
    srcIcon,
    label,
    rightHeader,
    visibleHeader = false,
    inputStyle,
    ...rest
  } = props || {};
  const renderSub = () => {
    if (loadingBalance) {
      return <ActivityIndicator style={styled.loadingIcon} size="small" />;
    }
    if (hasIcon) {
      return <Icon iconUrl={srcIcon} />;
    }
    if (hasInfinityIcon) {
      return (
        <MaxIcon
          style={styled.infinityIcon}
          onPress={() =>
            typeof onPressInfinityIcon === 'function' && onPressInfinityIcon()
          }
        />
      );
    }
  };
  return (
    <View style={styled.container}>
      {visibleHeader && (
        <Row style={styled.header}>
          <Text numberOfLines={1} style={styled.label}>
            {label}
          </Text>
          {rightHeader && rightHeader}
        </Row>
      )}
      <View style={styled.inputContainer}>
        <BaseTextInput
          style={{
            ...styled.input,
            ...inputStyle,
          }}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          ellipsizeMode="tail"
          numberOfLines={1}
          editable={editableInput}
          {...rest}
        />
        {renderSub()}
        {!!symbol && (
          <TouchableOpacity style={{ marginLeft: 8 }} onPress={onPressSymbol}>
            <Row style={{ alignItems: 'center' }}>
              {!!symbol && <Text style={styled.symbol}>{symbol}</Text>}
              {canSelectSymbol && <ArrowRight />}
            </Row>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

TradeInputAmount.defaultProps = {
  hasInfinityIcon: false,
  onPressInfinityIcon: undefined,
  symbol: undefined,
  canSelectSymbol: false,
  onPressSymbol: undefined,
  loadingBalance: false,
  editableInput: false,
  hasIcon: false,
  label: '',
  srcIcon: '',
  visibleHeader: false,
  rightHeader: undefined,
};

TradeInputAmount.propTypes = {
  hasInfinityIcon: PropTypes.bool,
  onPressInfinityIcon: PropTypes.func,
  symbol: PropTypes.string,
  canSelectSymbol: PropTypes.bool,
  onPressSymbol: PropTypes.func,
  loadingBalance: PropTypes.bool,
  editableInput: PropTypes.bool,
  hasIcon: PropTypes.bool,
  srcIcon: PropTypes.string,
  label: PropTypes.string,
  rightHeader: PropTypes.element,
  visibleHeader: PropTypes.bool,
};

export default React.memo(TradeInputAmount);
