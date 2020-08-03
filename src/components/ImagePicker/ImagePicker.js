import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Image, Text, TouchableOpacity } from '@src/components/core';
import styles from './styles';
import { ArrowRightGreyIcon } from '../Icons';

class ImagePicker extends Component {
  render() {
    const {
      onPick,
      file,
      text,
      defaultImageUri,
      onBlur,
      onFocus,
      label,
    } = this.props;
    const uri = file?.uri || defaultImageUri;
    return (
      <TouchableOpacity
        onPress={() => {
          typeof onPick === 'function' && onPick();
          typeof onFocus === 'function' && onFocus();
        }}
        onBlur={onBlur}
      >
        <View style={styles.container}>
          <Text style={styles.label}>{label || 'Icon'}</Text>
          <Text style={styles.text}>{text || 'Upload your image'}</Text>
          <View style={styles.hook}>
            {uri ? (
              <Image style={styles.image} source={{ uri }} />
            ) : (
              <View style={styles.circle} />
            )}
            <View style={styles.chooseFileContainer}>
              <Text style={styles.chooseFile}>Choose file</Text>
              <ArrowRightGreyIcon />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

ImagePicker.defaultProps = {
  file: null,
  text: null,
  defaultImageUri: null,
  onBlur: null,
  onFocus: null,
  label: 'Icon',
};

ImagePicker.propTypes = {
  onPick: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  file: PropTypes.object,
  text: PropTypes.string,
  defaultImageUri: PropTypes.string,
  label: PropTypes.string,
};

export default ImagePicker;
