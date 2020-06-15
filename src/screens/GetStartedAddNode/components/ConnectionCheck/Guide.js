import {Text, View} from '@src/components/core';
import React from 'react';
import {isIOS} from '@utils/platform';
import {Icon} from 'react-native-elements';
import {COLORS} from '@src/styles';
import styles from '../../styles';

const Guide = () => (
  <View style={styles.guide}>
    <View>
      <Text style={[styles.guideLine]}>
        <Text style={[styles.bold]}>Step 1:</Text>
          &nbsp;Open network settings
      </Text>
      <Text style={[styles.guideLine]}>
        <Text style={styles.bold}>Step 2:</Text>
          &nbsp;Select Node`s network
      </Text>
    </View>
  </View>
);

export default Guide;
