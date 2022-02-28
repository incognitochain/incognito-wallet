import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { View, ScrollViewBorder, Text, TouchableOpacity, Image , RoundCornerButton } from '@src/components/core';
import { View2 } from '@src/components/core/View';
import { Text4 } from '@src/components/core/Text';
import Header from '@src/components/Header';
import { useSelector } from 'react-redux';
import { colorsSelector } from '@src/theme/theme.selector';
import { RatioIcon } from '@components/Icons';
import { styled } from './styled';

export const UnshieldPortalCondition = (props) => {
  const [selectedId, setSelectedId] = useState(null);
  const { onConfirm, onGoBack } = props;
  const colors = useSelector(colorsSelector);
  const OPTIONS = [
    {
      id: 'to_user_wallet',
      label: 'I will unshield to my own andress (e.g. Trust wallet), which is not time-sensitive.',
      warning: ''
    },
    {
      id: 'to_exchange',
      label: 'I will unshield to another platform (e.g. exchange, lending service). I accept that any refunds will not be routed back to me, due to the random elements of the shielding and unshielding process. I also accept that funds may be lost if the receiving address is time-sensitive.',
      warning: ''
    }
  ];
  return (
    <View2 fullFlex>
      <Header title="Unshielding options" onGoBack={onGoBack} />
      <ScrollViewBorder style={styled.scrollview}>
        <Text style={[styled.text, { marginBottom: 22 }]}>
        Please read the conditions and select an option.
        </Text>
        {
          OPTIONS.map(option => (
            <>
              <TouchableOpacity
                style={[styled.selectedButton, {borderColor: colors.border1}]}
                key={option.id}
                onPress={() => setSelectedId(option.id)}
              >
                <View style={styled.contentView}>
                  <RatioIcon style={styled.icon} selected={option.id === selectedId} />
                  <Text4 style={[styled.text]}>{option.label}</Text4>
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
      </ScrollViewBorder>
    </View2>
  );
};

UnshieldPortalCondition.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onGoBack: PropTypes.func.isRequired
};
