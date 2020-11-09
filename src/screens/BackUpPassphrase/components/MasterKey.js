import React from 'react';
import PropTypes from 'prop-types';
import { Row } from '@src/components';
import { Text, TouchableOpacity } from '@components/core';
import { StyleSheet } from 'react-native';
import { COLORS, THEME } from '@src/styles';
import { ExportIcon } from '@components/Icons';
import Swipeout from 'react-native-swipeout';

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  flex: {
    flex: 1,
  },
  name: {
    ...THEME.text.mediumTextMotto,
    minHeight: 35,
    justifyContent: 'center',
    textAlignVertical: 'center',
    lineHeight: 35,
  },
  number: {
    marginRight: 15,
  },
  swipeOutButton: {
    paddingHorizontal: 25,
    backgroundColor: COLORS.white,
  },
  active: {
    ...THEME.text.mediumText,
  }
});

const MasterKey = ({ name, number, onPress, onDelete, isActive }) => {
  return (
    <Swipeout
      style={[styles.swipeOutButton]}
      right={
        onDelete
          ? [{
            text: 'Delete',
            backgroundColor: COLORS.red,
            onPress: () => onDelete(name),
          }]
          : []
      }
    >
      <TouchableOpacity onPress={onPress}>
        <Row style={styles.container} spaceBetween center>
          <Text
            style={[styles.name, isActive && styles.active, styles.flex]}
            numberOfLines={1}
          >
            {name}
          </Text>
          <Row center>
            <Text style={[styles.name, styles.number]}>{number}</Text>
            <ExportIcon />
          </Row>
        </Row>
      </TouchableOpacity>
    </Swipeout>
  );
};

MasterKey.propTypes = {
  name: PropTypes.string.isRequired,
  number: PropTypes.array.isRequired,
  onPress: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  isActive: PropTypes.bool,
};

MasterKey.defaultProps = {
  onDelete: undefined,
  isActive: false,
};

export default MasterKey;

