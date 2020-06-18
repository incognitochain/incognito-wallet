import React from 'react';
import { View, StyleSheet } from 'react-native';
import { withLayout_2 } from '@src/components/Layout';
import Header from '@src/components/Header';
import QrCodeGenerate from '@src/components/QrCodeGenerate';
import { CopiableTextDefault } from '@src/components/CopiableText';
import PropTypes from 'prop-types';
import { useNavigationParam } from 'react-navigation-hooks';

const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  qrCode: {
    marginTop: 42,
    marginBottom: 50,
  },
});

const ExportAccountModal = (props) => {
  const { label, value } = useNavigationParam('params');
  return (
    <View style={styled.container}>
      <Header title={label} />
      <QrCodeGenerate style={styled.qrCode} value={value} size={175} />
      <CopiableTextDefault data={value} />
    </View>
  );
};

ExportAccountModal.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default withLayout_2(React.memo(ExportAccountModal));
