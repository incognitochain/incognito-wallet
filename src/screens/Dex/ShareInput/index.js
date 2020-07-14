import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity } from '@src/components/core';
import { useNavigation } from 'react-navigation-hooks';
import ROUTE_NAMES from '@routers/routeNames';
import { ArrowRightGreyIcon } from '@components/Icons';
import { BtnInfinite } from '@components/Button/index';
import { MESSAGES } from '@screens/Dex/constants';
import Input from './Input';
import stylesheet from './style';

const RightIcon = () => <ArrowRightGreyIcon style={stylesheet.icon} />;

const InputContainer = (props) => {
  const navigation = useNavigation();

  const {
    pair,
    onSelectPair,
    onChange,
    value,
    pairs,
    disabled,
  } = props;

  if (pairs.length <= 0 || !pairs) {
    return <Text>{MESSAGES.NO_PAIR}</Text>;
  }

  const showSelectTokenScreen = () => {
    navigation.navigate(ROUTE_NAMES.PairSelectScreen, {
      onSelectPair,
      pairs,
    });
  };

  const handleMax = () => {
    onChange(pair.share.toString());
  };

  return (
    <View style={stylesheet.wrapper}>
      <View style={[stylesheet.row, stylesheet.justifyBetween]}>
        <Input
          onChange={onChange}
          value={value}
          disabled={disabled}
        />
        <BtnInfinite
          style={[stylesheet.centerJustify, stylesheet.symbol]}
          onPress={handleMax}
        />
        <TouchableOpacity onPress={showSelectTokenScreen} style={stylesheet.centerJustify}>
          {pair ? (
            <View style={stylesheet.token}>
              <Text style={stylesheet.bigText}>
                {pair.token1.symbol} - {pair.token2.symbol}
              </Text>
              <RightIcon />
            </View>
          ) : null}
        </TouchableOpacity>
      </View>
    </View>
  );
};


InputContainer.defaultProps = {
  pair: null,
  value: undefined,
  onChange: undefined,
  disabled: false,
};

InputContainer.propTypes = {
  pair: PropTypes.object,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  pairs: PropTypes.array.isRequired,
  onSelectPair: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

export default InputContainer;
