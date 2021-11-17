import React from 'react';
import PropTypes from 'prop-types';
import { View } from '@src/components/core';
import { styled } from './Tabs.styled';
import withTabs from './Tabs.enhance';

const Tabs = (props) => {
  const { renderTabs, styledTabList, styledTabs, useTab1, rightCustom } = props;
  return (
    <View style={[styled.tabs, styledTabs]}>
      <View
        style={[
          styled.tabList,
          useTab1 ? styled.tabList1 : null,
          styledTabList,
        ]}
      >
        {renderTabs()}
      </View>
      {rightCustom && rightCustom}
    </View>
  );
};

Tabs.defaultProps = {
  styledTabList: null,
  styledTabs: null,
};

Tabs.propTypes = {
  styledTabList: PropTypes.any,
  styledTabs: PropTypes.any,
  renderTabs: PropTypes.func.isRequired,
};

export default withTabs(React.memo(Tabs));
