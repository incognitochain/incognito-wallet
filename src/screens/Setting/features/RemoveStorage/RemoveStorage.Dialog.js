import React, { memo } from 'react';
import { View, StyleSheet, Modal, Text } from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, FONT } from '@src/styles';
import { ButtonBasic } from '@components/Button';

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 27,
  },
  wrapContent: {
    backgroundColor: COLORS.white,
    width: '100%',
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 30,
  },
  title: {
    ...FONT.STYLE.bold,
    fontSize: FONT.SIZE.superMedium,
    alignSelf: 'center',
  },
  subTitle: {
    ...FONT.STYLE.medium,
    fontSize: FONT.SIZE.regular,
    alignSelf: 'center',
    textAlign: 'center',
    color: COLORS.newGrey,
    marginTop: 15,
  },
  buttonStyle: {
    borderRadius: 25,
    height: 50,
    marginTop: 30,
    width: '48%',
  },
});

const CONTENT = {
  title: 'Clear history',
  subTitle:
    'This will delete transaction histories from display. Are you sure you want to continue?',
  cancel: 'Cancel',
  accept: 'OK',
};

const RemoveDialog = (props) => {
  const {
    visible,
    onPressCancel,
    onPressAccept,
    title,
    subTitle,
    acceptStr,
    canStr,
  } = props;
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.wrapContent}>
          <Text style={styles.title}>{title || CONTENT.title}</Text>
          <Text style={styles.subTitle}>{subTitle || CONTENT.subTitle}</Text>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <ButtonBasic
              onPress={onPressCancel}
              title={canStr || CONTENT.cancel}
              btnStyle={styles.buttonStyle}
            />
            <ButtonBasic
              onPress={onPressAccept}
              title={acceptStr || CONTENT.accept}
              btnStyle={styles.buttonStyle}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

RemoveDialog.propTypes = {
  visible: PropTypes.bool,
  onPressCancel: PropTypes.func.isRequired,
  onPressAccept: PropTypes.func.isRequired,
  title: PropTypes.string,
  subTitle: PropTypes.string,
  acceptStr: PropTypes.string,
};

RemoveDialog.defaultProps = {
  visible: true,
  title: '',
  subTitle: '',
  acceptStr: undefined,
};

export default memo(RemoveDialog);
