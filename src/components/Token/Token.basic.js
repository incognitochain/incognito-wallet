import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { UTILS } from '@src/styles';
import PropTypes from 'prop-types';
import { Name, Symbol, Amount } from './Token';
import withToken from './Token.enhance';
import { styled } from './Token.styled';

const _styled = StyleSheet.create({
  styledName: {
    maxWidth: UTILS.screenWidth() / 2,
  },
});

const TokenBasic = props => {
  const { onPress, style, showBalance = false } = props;
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styled.container, style]}>
        <View style={[styled.extra]}>
          <Name styledName={_styled.styledName} />
          {showBalance && (
            <Amount {...{ ...props, customStyle: styled.boldText }} />
          )}
        </View>
        <View style={styled.extra}>
          <Symbol />
        </View>
      </View>
    </TouchableOpacity>
  );
};

TokenBasic.defaultProps = {
  style: null,
};
TokenBasic.propTypes = {
  onPress: PropTypes.func.isRequired,
  style: PropTypes.any,
  showBalance: PropTypes.bool,
};

export default withToken(React.memo(TokenBasic));
