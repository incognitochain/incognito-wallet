import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { HasNotificationIcon } from '@src/components/Icons';
import PropTypes from 'prop-types';

const styled = StyleSheet.create({
  btnStyle: {
    width: 50,
    height: 40,
    justifyContent: 'center',
  },
});

const BtnNotification = (props) => {
  const { btnStyle } = props;
  return (
    <TouchableOpacity style={[styled.btnStyle, btnStyle]} {...props}>
      <HasNotificationIcon />
    </TouchableOpacity>
  );
};

BtnNotification.defaultProps = {
  btnStyle: null,
};

BtnNotification.propTypes = {
  btnStyle: PropTypes.any,
};

export default BtnNotification;
