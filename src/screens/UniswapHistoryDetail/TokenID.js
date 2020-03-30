import React from 'react';
import PropTypes from 'prop-types';
import {Text, View} from '@components/core';
import CopiableText from '@components/CopiableText/CopiableText';
import {Icon} from 'react-native-elements';
import {COLORS} from '@src/styles';import stylesheet from './style';


const TokenID = ({ text, label }) => {
  return (
    <View style={stylesheet.row}>
      <Text style={stylesheet.field}>{label}</Text>
      <CopiableText style={stylesheet.txButton} text={text} copiedMessage={`${label} was copied.`}>
        <Text style={[stylesheet.textRight, stylesheet.tokenId]} numberOfLines={1} ellipsizeMode="middle">{text}</Text>
        {!!text && <Icon name="copy" type="font-awesome" size={16} color={COLORS.lightGrey1} />}
      </CopiableText>
    </View>
  );
};

TokenID.defaultProps = {
  label: '',
};

TokenID.propTypes = {
  text: PropTypes.string.isRequired,
  label: PropTypes.string
};

export default TokenID;
