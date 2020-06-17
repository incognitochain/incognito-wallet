import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';

const styled = StyleSheet.create({
  btnStyle: {
    width: 32,
    height: 32,
    justifyContent: 'center',
  },
});

const BtnAdd = props => {
  const {btnStyle} = props;
  return (
    <TouchableOpacity style={[styled.btnStyle, btnStyle]} {...props}>
      <Ionicons name="ios-add-circle" size={25} />
    </TouchableOpacity>
  );
};

BtnAdd.defaultProps = {
  btnStyle: null,
};

BtnAdd.propTypes = {
  btnStyle: PropTypes.any,
};

export default BtnAdd;
