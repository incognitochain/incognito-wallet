import React from 'react';
import { StyleSheet, View, Text, Clipboard } from 'react-native';
import { ButtonBasic } from '@src/components/Button';
import { COLORS, FONT } from '@src/styles';
import PropTypes from 'prop-types';

const styled = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.colorGrey,
  },
  text: {
    flex: 1,
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 6,
    color: COLORS.colorGreyBold,
    marginHorizontal: 15,
  },
  btnStyle: {
    height: 40,
    paddingHorizontal: 20,
  },
  titleStyle: {
    fontSize: FONT.SIZE.regular - 1,
  },
});

const CopiableText = props => {
  const { data } = props;
  const [copied, setCopied] = React.useState(false);
  const handleCopyText = () => {
    Clipboard.setString(data);
    setCopied(true);
  };
  return (
    <View style={styled.container}>
      <Text style={styled.text} numberOfLines={1} ellipsizeMode="middle">
        {data}
      </Text>
      <ButtonBasic
        btnStyle={styled.btnStyle}
        titleStyle={styled.titleStyle}
        title={copied ? 'Copied' : 'Copy'}
        onPress={handleCopyText}
      />
    </View>
  );
};

CopiableText.propTypes = {
  data: PropTypes.string.isRequired,
};

export default CopiableText;
