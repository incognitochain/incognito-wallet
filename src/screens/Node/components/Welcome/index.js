import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity } from 'react-native';
import { Text, Image, View, Button, ScrollView } from '@components/core';
import nodeImg from '@assets/images/node/node.png';
import NavigationService from '@src/services/NavigationService';
import routeNames from '@src/router/routeNames';
import Header from '@src/components/Header';
import theme from '@src/styles/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '@src/styles';
import styles from './style';

const WelcomeNodes = ({ onAddPNode, onAddVNode }) => (
  <ScrollView style={styles.container}>
    <Header
      title="Nodes"
    />
    <View style={styles.pNode}>
      <Image style={styles.pNodeImg} source={nodeImg} resizeMode="contain" resizeMethod="resize" />
      <Button
        style={[styles.pNodeButton, theme.BUTTON.BLACK_TYPE]}
        onPress={onAddPNode}
        title='Add Node Device'
        titleStyle={[theme.text.BUTTON_TITLE]}
      />
      <Text style={styles.buyText}>Don&apos;t have a Node yet?</Text>
      <TouchableOpacity style={[theme.FLEX.rowSpaceBetweenCenter]} onPress={() => { NavigationService.navigate(routeNames.BuyNodeScreen); }}>
        <Text style={styles.getNode}>Get a Node</Text>
        <Ionicons name="ios-arrow-forward" color={COLORS.lightGrey1} size={24} />
      </TouchableOpacity>
      <Text style={[styles.buyText, theme.MARGIN.marginTopAvg]}>Experienced Node operators?</Text>
      <TouchableOpacity style={[theme.FLEX.rowSpaceBetweenCenter]} onPress={onAddVNode}>
        <Text style={styles.getNode}>Add Node Virtual</Text>
        <Ionicons name="ios-arrow-forward" color={COLORS.lightGrey1} size={24} />
      </TouchableOpacity>
    </View>
  </ScrollView>
);

WelcomeNodes.propTypes = {
  onAddVNode: PropTypes.func.isRequired,
  onAddPNode: PropTypes.func.isRequired,
};

export default WelcomeNodes;
