import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import PropTypes from 'prop-types';

const styled = StyleSheet.create({
  btnStyle: {
    height: 32,
    justifyContent: 'center',
  },
  statusContainer: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginEnd: 20,
  },  
});

const BtnStatus = props => {
  const {btnStyle} = props;
  return (
    <TouchableOpacity style={[styled.btnStyle, btnStyle]} {...props}>
      <View style={[styled.statusContainer, { backgroundColor: props?.backgroundColor }]} />
    </TouchableOpacity>
  );
};

BtnStatus.defaultProps = {
  btnStyle: null,
};

BtnStatus.propTypes = {
  btnStyle: PropTypes.any,
};
export default BtnStatus;
