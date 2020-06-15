import PropTypes from 'prop-types';
import { Button, Text, Image, ScrollView, View } from '@src/components/core';
import turn_off_cellular from '@src/assets/images/node/turn_off_cellular.png';
import nodeStep32IOS from '@src/assets/images/node/node_setup_step32_ios.png';
import React from 'react';
import { isIOS } from '@utils/platform';
import theme from '@src/styles/theme';
import Guide from './Guide';
import styles from '../../styles';

const controlName = isIOS() ? 'Control center' : 'Status bar';
const bottomImage = isIOS() ? nodeStep32IOS : null;

const TurnOffCellular = ({ onNext }) => (
  <ScrollView>
    <Text style={styles.title2}>Turn off mobile data.</Text>
    <View>
      <Image
        style={styles.content_step3_image}
        source={turn_off_cellular}
        resizeMode="contain"
        resizeMethod="resize"
      />
      <Guide />
    </View>
    <View style={styles.footer}>
      <Button
        style={[theme.BUTTON.BLACK_TYPE]}
        onPress={onNext}
        title="Next"
      />
    </View>
  </ScrollView>
);

TurnOffCellular.propTypes = {
  onNext: PropTypes.func.isRequired,
};

export default TurnOffCellular;
