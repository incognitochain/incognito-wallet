import React from 'react';
import PropTypes from 'prop-types';
import { View } from '@src/components/core';
import { styled } from './Tabs.styled';
import withTabs from './Tabs.enhance';

const Tabs = (props) => {
  const { renderTabs, styledTabList, styledTabs } = props;
  return (
    <View style={[styled.tabs, styledTabs]}>
      <View style={[styled.tabList, styledTabList]}>{renderTabs()}</View>
    </View>
  );
};

Tabs.defaultProps = {
  styledTabList: null,
  styledTabs: null,
};

Tabs.propTypes = {
  rootTabID: PropTypes.string.isRequired,
  styledTabList: PropTypes.any,
  styledTabs: PropTypes.any,
  onClickTabItem: PropTypes.func.isRequired,
  renderTabs: PropTypes.func.isRequired,
};

export default withTabs(React.memo(Tabs));
