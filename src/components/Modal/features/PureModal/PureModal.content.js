import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { COLORS, UTILS } from '@src/styles';

const styled = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: {
    backgroundColor: COLORS.white,
    marginHorizontal: 24,
    borderRadius: 13,
    width: UTILS.deviceWidth() - 50,
    paddingHorizontal: 24,
    paddingVertical: 24,
    position: 'relative',
  },
});

const PureModalContent = (props) => {
  const { children, styledContainer, styledWrapper } = props;
  return (
    <View style={[styled.container, styledContainer]}>
      <View style={[styled.wrapper, styledWrapper]}>{children}</View>
    </View>
  );
};

PureModalContent.propTypes = {
  bowel: PropTypes.any.isRequired,
  styledContainer: PropTypes.any,
  styledWrapper: PropTypes.any,
};

export default React.memo(PureModalContent);
