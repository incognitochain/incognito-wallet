import PropTypes from 'prop-types';
import { Button, Text, Image, ScrollView, View } from '@src/components/core';
import nodeStep1 from '@src/assets/images/node/node_setup_step1.png';
import React, { PureComponent } from 'react';
import styles from '../../styles';

class ConnectionCheck extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  render() {
    const { onNext } = this.props;
    return (
      <ScrollView>
        <Text style={styles.title2}>Make sure Node is plugged in.</Text>
        <View style={styles.content}>
          <Image
            style={styles.content_step1_image}
            source={nodeStep1}
          />
        </View>
        <View style={styles.footer}>
          <Button
            onPress={onNext}
            title="Done"
          />
        </View>
      </ScrollView>
    );
  }
}

ConnectionCheck.propTypes = {
  onNext: PropTypes.func.isRequired,
  goToScreen: PropTypes.func.isRequired,
};

export default ConnectionCheck;
