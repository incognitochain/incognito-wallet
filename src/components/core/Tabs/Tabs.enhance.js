import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useDispatch, useSelector } from 'react-redux';
import { ExHandler } from '@src/services/exception';
import { View } from '@src/components/core';
import { actionChangeTab } from './Tabs.actions';
import { styled } from './Tabs.styled';
import { activedTabSelector } from './Tabs.selector';
import Tab from './Tabs.tab';
import Tab1 from './Tabs.tab1';

const enhance = (WrappedComp) => (props) => {
  const {
    children,
    rootTabID,
    useTab1 = false,
    defaultTabIndex,
    renderTabsAtBottom = false,
  } = props;
  const activeTab = useSelector(activedTabSelector)(rootTabID);
  const dispatch = useDispatch();
  const onClickTabItem = (tab) => {
    try {
      const foundTab = children.find((chil) => chil.props.tabID === tab);
      const { onChangeTab } = foundTab.props || {};
      if (activeTab !== tab) {
        dispatch(
          actionChangeTab({
            rootTabID,
            tabID: tab,
          }),
        );
        if (typeof onChangeTab === 'function') {
          onChangeTab();
        }
      }
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  const renderTabs = () => {
    return children.map((child) => {
      const { label, tabID, ...rest } = child.props;
      if (useTab1) {
        return (
          <Tab1
            activeTab={activeTab}
            key={tabID}
            label={label}
            onClickTab={onClickTabItem}
            tabID={tabID}
            {...rest}
          />
        );
      }
      return (
        <Tab
          activeTab={activeTab}
          key={tabID}
          label={label}
          onClickTab={onClickTabItem}
          tabID={tabID}
          {...rest}
        />
      );
    });
  };
  React.useEffect(() => {
    if (children) {
      const { tabID, onChangeTab } = children[defaultTabIndex ?? 0].props || {};
      dispatch(
        actionChangeTab({
          rootTabID,
          tabID,
        }),
      );
      if (typeof onChangeTab === 'function') {
        onChangeTab();
      }
    }
  }, [defaultTabIndex]);
  const renderComponent = () => {
    let Comp;
    if (renderTabsAtBottom) {
      Comp = (
        <>
          <View style={styled.tabContent}>
            {children.map((child) => {
              if (child.props.tabID !== activeTab) return null;
              return child.props.children;
            })}
          </View>
          <WrappedComp {...{ ...props, onClickTabItem, renderTabs }} />
        </>
      );
    } else {
      Comp = (
        <>
          <WrappedComp {...{ ...props, onClickTabItem, renderTabs }} />
          <View style={styled.tabContent}>
            {children.map((child) => {
              if (child.props.tabID !== activeTab) return null;
              return child.props.children;
            })}
          </View>
        </>
      );
    }
    return Comp;
  };
  return <ErrorBoundary>{renderComponent()}</ErrorBoundary>;
};

export default enhance;
