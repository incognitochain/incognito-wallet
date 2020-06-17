import routeNames from '@routers/routeNames';
import BaseScreen from '@screens/BaseScreen';
import images from '@src/assets';
import { onClickView } from '@src/utils/ViewUtil';
import React from 'react';
import { Image, TouchableOpacity, View, Text } from 'react-native';
import { ListItem } from '@src/components/core';
import Header from '@src/components/Header';
import styles, { rightNextIcon } from './styles';

export const TAG = 'AddNode';
const listItems = [
  {
    title: 'Node',
    subTitle: 'Plug in and connect',
    routeName: routeNames.GetStaredAddNode
  },
  {
    title: 'Link existing device',
    subTitle: 'Link existing or remove Node devices',
    routeName: routeNames.LinkDevice
  },
  {
    title: 'Node Virtual',
    subTitle: 'Run a virtual node',
    routeName: routeNames.AddSelfNode
  },
];

class AddNode extends BaseScreen {
  render() {
    return (
      <View style={styles.container}>
        {this.renderListActions()}
      </View>
    );
  }

  set loading(isLoading) {
    this.setState({
      loading: isLoading
    });
  }

  handleItemClick = (index) => {
    if (index === 2) {
      return this.goToScreen(routeNames.LinkDevice);
    }

    this.goToScreen(index === 0 ? routeNames.GetStaredAddNode : routeNames.AddSelfNode);
  };

  renderItem = (item) => {
    return (
      <TouchableOpacity onPress={() => this.goToScreen(item?.routeName)} style={styles.contentItem}>
        <Text style={styles.title}>
          {item?.title}
        </Text>
        <Text style={styles.subTitle}>
          {item?.subTitle}
        </Text>
      </TouchableOpacity>
    );
  }

  renderListActions = () => {
    return (
      <View style={styles.container_list_action}>
        <Header title="Add a Node" />
        <View style={styles.content}>
          {listItems?.map(item => {
            return (
              this.renderItem(item)
            );
          })}
        </View>
      </View>
    );
  };
}

AddNode.propTypes = {};

AddNode.defaultProps = {};

export default AddNode;
