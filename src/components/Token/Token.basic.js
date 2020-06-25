import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { TouchableOpacity } from '@src/components/core';
import { Name, Symbol, Amount, Follow } from './Token';
import withToken from './Token.enhance';
import { styled } from './Token.styled';

const TokenBasic = (props) => {
  const { onPress, style, showBalance, shouldShowFollowed } = props;
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styled.container, style]}>
        <View style={[styled.extra, styled.extraTop]}>
          <Name {...props} />
          {showBalance && (
            <Amount {...{ ...props, customStyle: styled.boldText }} />
          )}
          {shouldShowFollowed && <Follow {...props} />}
        </View>
        <View style={styled.extra}>
          <Symbol {...props} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

TokenBasic.defaultProps = {
  style: null,
  showBalance: false,
  rightTopExtra: null,
  shouldShowFollowed: false,
};
TokenBasic.propTypes = {
  onPress: PropTypes.func.isRequired,
  style: PropTypes.any,
  showBalance: PropTypes.bool,
  rightTopExtra: PropTypes.element,
  shouldShowFollowed: PropTypes.bool,
};

export default withToken(React.memo(TokenBasic));
