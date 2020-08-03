import React from 'react';
import { compose } from 'recompose';
import { ScrollView, View } from '@components/core';
import { withLayout_2 } from '@components/Layout';
import Section from '@components/HelpScreen/Section';
import { StyleSheet } from 'react-native';
import { UTILS } from '@src/styles';
import { Header } from '@src/components/';

const sections = [
  {
    title: 'Compounding Rewards',
    description: 'This number is your total PRV rewards balance, which reflects automatic compounding at currency-specific rates.',
  },
  {
    title: 'APY rates',
    description: 'Current rates are noted here in grey. These are subject to change at any time.',
  },
  {
    title: 'Rewards for each currency',
    description: 'Under the balance of each currency provided, you’ll see a rewards counter specific to that currency. This number will update and compound every 1 hour. Rewards are paid in PRV based on current prices.',
  },
];

const styles = StyleSheet.create({
  container: {
    paddingTop: UTILS.heightScale(20),
    paddingBottom: UTILS.heightScale(20),
  },
});

const Help = () => {
  React.useEffect(() => {

  }, []);

  return (
    <View>
      <Header title="How rewards are calculated" />
      <ScrollView style={styles.container}>
        {sections.map(item => (
          <Section
            title={item.title}
            description={item.description}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default compose(
  withLayout_2,
)(Help);
