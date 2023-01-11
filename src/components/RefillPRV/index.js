import { Text, View } from '@components/core';
import { BtnPrimary } from '@components/core/Button';
import { colorsSelector } from '@src/theme';
import React, { memo } from 'react';
import Modal from 'react-native-modal';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import styles from './styles';

const RefillPRV = ({
  isVisible,
  cancelOnClick,
  confirmOnClick,
  onTouchOutside,
}) => {
  const colors = useSelector(colorsSelector);
  return (
    <View>
      <Modal
        isVisible={isVisible}
        style={styles.dialog}
        onTouchOutside={onTouchOutside}
      >
        <View style={styles.hook}>
          {/* <Text style={[styles.title, { color: colors.text1 }]}>
            Unified Information Alert Title
          </Text> */}
          <Text style={[styles.desc, { color: colors.white }]}>
            You need to refill PRV for the wallet to cover the network fee.
          </Text>

          <View style={styles.buttonArea}>
            {/* <BtnPrimary
              title="Later"
              onPress={cancelOnClick}
              wrapperStyle={styles.wrapperCancelBtn}
              textStyle={{ color: colors.ctaMain }}
            /> */}
            <View style={styles.spaceView} />
            <BtnPrimary
              title="Sure"
              onPress={confirmOnClick}
              wrapperStyle={styles.wrapperConfirmBtn}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

RefillPRV.defaultProps = {
  isVisible: false,
  cancelOnClick: () => {},
  confirmOnClick: () => {},
  onTouchOutside: () => {},
};

RefillPRV.propTypes = {
  isVisible: PropTypes.bool,
  cancelOnClick: PropTypes.any,
  confirmOnClick: PropTypes.any,
  onTouchOutside: PropTypes.any,
};

export default memo(RefillPRV);
