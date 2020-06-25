import { Text, View } from '@src/components/core';
import React from 'react';
import { isIOS, isAndroid } from '@utils/platform';
import { Icon } from 'react-native-elements';
import { COLORS } from '@src/styles';
import styles from '../../styles';

const Guide = () => (
  <View style={styles.guide}>

    <View style={{ marginTop: 10 }}>
      <Text style={[styles.guideLine]}>
        <Text style={[styles.bold]}>Step 1: </Text>
          &nbsp;Go to network settings
      </Text>
      <Text style={[styles.guideLine]}>
        <Text style={styles.bold}>Step 2: </Text>
          &nbsp;Turn off cellular/mobile data
      </Text>
    </View>
  </View>
);

export default Guide;
