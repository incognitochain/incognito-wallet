import React from 'react';
import {View, StyleSheet, TextInput, TouchableOpacity} from 'react-native';
import {SearchIcon, ClearIcon} from '@src/components/Icons';
import {FONT, COLORS} from '@src/styles';
import PropTypes from 'prop-types';

const styled = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGrey6,
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 6,
  },
});

const SearchInput = props => {
  const {onClearText, value, ...rest} = props;
  return (
    <View style={styled.container}>
      <SearchIcon />
      <TextInput style={styled.input} {...{...rest, value}} />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClearText}>
          <ClearIcon />
        </TouchableOpacity>
      )}
    </View>
  );
};

SearchInput.defaultProps = {
  onClearText: () => null,
};

SearchInput.propTypes = {
  onClearText: PropTypes.func,
};

export default SearchInput;
