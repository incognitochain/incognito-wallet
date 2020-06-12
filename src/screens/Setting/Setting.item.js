import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import ReceiverIcon from '@src/components/Icons/icon.receiver';
import {COLORS, FONT} from '@src/styles';
import React from 'react';
import PropTypes from 'prop-types';

const styled = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGrey2,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 6,
    color: COLORS.dark1,
    flex: 1,
    paddingLeft: 20,
  },
});

const Item = ({title, handlePress, disabled, lastChild, icon}) => {
  return (
    <TouchableOpacity onPress={handlePress} disabled={disabled}>
      <View
        style={[
          styled.item,
          disabled && {opacity: 0.5},
          lastChild && {borderBottomWidth: 0},
        ]}
      >
        {icon}
        <Text style={styled.title}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

Item.defaultProps = {
  disabled: false,
  lastChild: false,
};

Item.propTypes = {
  title: PropTypes.string.isRequired,
  handlePress: PropTypes.func.isRequired,
  icon: PropTypes.element.isRequired,
  disabled: PropTypes.bool,
  lastChild: PropTypes.bool,
};

export default Item;
