import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, ActivityIndicator } from '@src/components/core';
import { useNavigation } from 'react-navigation-hooks';
import ROUTE_NAMES from '@routers/routeNames';
import { ArrowRightGreyIcon } from '@components/Icons';
import { BtnInfinite } from '@components/Button';
import Input from './Input';
import stylesheet from './style';

const RightIcon = () => <ArrowRightGreyIcon style={stylesheet.icon} />;

const InputContainer = (props) => {
  const navigation = useNavigation();

  const {
    token,
    onSelectToken,
    onChange,
    value,
    tokens,
    disabled,
    loading,
    placeholder,
    selectable,
    maxValue,
  } = props;
  const showSelectTokenScreen = () => {
    navigation.navigate(ROUTE_NAMES.TokenSelectScreen, {
      onSelectToken,
      tokens,
      placeholder: 'Search coins',
    });
  };

  return (
    <View style={stylesheet.wrapper}>
      <View style={[stylesheet.row, stylesheet.justifyBetween]}>
        {onChange ? (
          <Input
            onChange={onChange}
            value={value}
            disabled={disabled}
            placeholder={placeholder}
          />
        ) : (
          <Text numberOfLines={1} style={[stylesheet.bigText, stylesheet.inputContainer]}>
            {value}
          </Text>
        )}
        {!!loading && <ActivityIndicator />}
        {!!maxValue && (
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <BtnInfinite onPress={() => onChange(maxValue)} />
          </View>
        ) }
        {selectable ? (
          <TouchableOpacity onPress={showSelectTokenScreen} style={stylesheet.centerJustify}>
            {token ? (
              <View style={stylesheet.token}>
                <Text style={stylesheet.bigText} isVerified={token.isVerified}>
                  {token.symbol}
                </Text>
                <RightIcon />
              </View>
            ) : <RightIcon />}
          </TouchableOpacity>
        ) : (
          <View style={stylesheet.token}>
            <Text style={stylesheet.bigText} isVerified={token.isVerified}>
              {token.symbol}
            </Text>
            <View style={stylesheet.icon} />
          </View>
        )}
      </View>
    </View>
  );
};


InputContainer.defaultProps = {
  token: null,
  value: undefined,
  onChange: undefined,
  disabled: false,
  loading: false,
  selectable: true,
  maxValue: undefined,
};

InputContainer.propTypes = {
  token: PropTypes.object,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  tokens: PropTypes.array.isRequired,
  onSelectToken: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  selectable: PropTypes.bool,
  maxValue: PropTypes.number,
};

export default InputContainer;
