import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { View, ScrollView, Text, TouchableOpacity, Image , RoundCornerButton } from '@src/components/core';
import Header from '@src/components/Header';
import ic_radio from '@src/assets/images/icons/ic_radio.png';
import ic_radio_check from '@src/assets/images/icons/ic_radio_check.png';
import { styled } from './styled';

export const UnshieldPortalCondition = (props) => {
  const [selectedId, setSelectedId] = useState(null);
  const { onConfirm, onGoBack } = props;
  const OPTIONS = [
    {
      id: 'to_user_wallet',
      label: 'I will unshield to my own andress (e.g. Trust wallet), which is not time-sensitive.',
      warning: ''
    },
    {
      id: 'to_exchange',
      label: 'I will unshield to another platform (e.g. exchange, lending service). I accept that any refunds to the sending address will not be processed, and that funds may be lost if the receiving address is time-sensitive.',
      warning: ''
    }
  ];
  return (
    <View style={styled.container}>
      <Header title="Unshielding options" onGoBack={onGoBack} />
      <ScrollView style={styled.scrollview}>
        <Text style={[styled.text, { marginBottom: 22 }]}>
        Please read the conditions and select an option.
        </Text>
        {
          OPTIONS.map(option => (
            <>
              <TouchableOpacity
                style={option.id === selectedId ? styled.selectedButton : styled.unSelectedButon}
                key={option.id}
                onPress={() => setSelectedId(option.id)}
              >
                <View style={styled.contentView}>
                  <Image style={styled.icon} source={option.id === selectedId ? ic_radio_check : ic_radio} />
                  <Text style={[styled.text, option.id === selectedId ? styled.labelTextActive : styled.labelText ]}>{option.label}</Text>
                </View>
              </TouchableOpacity>
              {
                selectedId === option.id && !!option.warning && (
                  <View style={styled.warning}>
                    <Text style={styled.warningText}>{option.warning}</Text>
                  </View>
                )
              }
            </>
          ))
        }
        <RoundCornerButton
          style={styled.button}
          title="Continue"
          disabled={!selectedId}
          onPress={onConfirm}
        />
      </ScrollView>
    </View>
  );
};

UnshieldPortalCondition.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onGoBack: PropTypes.func.isRequired
};