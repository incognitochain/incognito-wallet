import React from 'react';
import { Text, ScrollView, View } from '@src/components/core';
import Header from '@src/components/Header';
import { COLORS } from '@src/styles';
import styles from './style';

const NodeItemsHelp = () => {
  const renderItem = (text, color) => {
    return (
      <View style={{flexDirection: 'row', alignItems: 'flex-start', marginTop: 10}}>
        <View style={{height: 28, justifyContent: 'center'}}>
          <View style={{width: 14, height: 14, borderRadius: 7, backgroundColor: color, marginEnd: 10}} />
        </View>
        <Text style={styles.textLine}>
          {text}
        </Text>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <Header title="How to manage your Nodes" />
      <ScrollView>
        <View style={{ marginTop: 30 }}>
          <Text style={styles.text}>
            On this screen, you’ll see your list of Nodes, along with their statuses and reward balances.
          </Text>
        </View>
        <View>
          <Text style={styles.title}>
            What the different colors mean
          </Text>
          <Text style={styles.text}>
            Each colored dot indicates the Node status
          </Text>
          {renderItem('Your Node is currently working and earning.', COLORS.blue)}
          {renderItem('Your Node is online and waiting to be selected.', 'green')}
          {renderItem('Your Node is in the process of unstaking.', 'orange')}
          {renderItem('Your Node is not active. Tap on it for activation instructions.', COLORS.colorGreyBold)}
        </View>
        <View style={{ paddingBottom: 100, marginTop: 10 }}>
          <Text style={styles.title}>
            How to withdraw rewards and view more details
          </Text>
          <Text style={styles.text}>
            Just tap on the Node to pull up a screen with more information. You’ll see your rewards balance, associated keychain, status details, instructions, explanations and more.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default React.memo(NodeItemsHelp);
