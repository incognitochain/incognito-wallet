import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import PropTypes from 'prop-types';
import { headerTabStyle } from '@screens/Dex/style';
import { HEADER_TABS } from '@screens/Dex/Liquidity.constants';
import { batch, useDispatch } from 'react-redux';
import { actionChangeHistoryTab, actionChangeTab, actionFilterOutput } from '@screens/Dex/Liquidity.actions';

const Tabs = React.memo(({ selected, disable, isHistory }) => {
  const dispatch = useDispatch();

  const onSelectItem = (tabName) => {
    if (selected === tabName || disable) return;
    if (isHistory) {
      return dispatch(actionChangeHistoryTab({ tabName }));
    }
    batch(() => {
      dispatch(actionChangeTab({ tabName }));
      dispatch(actionFilterOutput());
    });
  };

  const renderItem = (item) => {
    const isSelected = selected === item;
    return(
      <TouchableOpacity
        key={item}
        style={[headerTabStyle.wrapItem, isSelected && headerTabStyle.itemSelected]}
        onPress={() => onSelectItem(item)}
      >
        <Text style={[isSelected ? headerTabStyle.textSelected : headerTabStyle.textUnSelected]}>{item}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={headerTabStyle.wrapper}>
      {Object.keys(HEADER_TABS).filter(item => item !== 'Add').map(renderItem)}
    </View>
  );
});

Tabs.defaultProps = {
  isHistory: false
};
Tabs.propTypes = {
  selected: PropTypes.string.isRequired,
  disable: PropTypes.bool.isRequired,
  isHistory: PropTypes.bool
};

export default Tabs;
