import React from 'react';
import { Text, ScrollView } from '@src/components/core';
import Header from '@src/components/Header';
import styles from './style';

const WhySend = () => {
  return (
    <ScrollView style={styles.container}>
      <Header title="When to use Send ?" />
      <Text style={styles.title}>
      Use Send to transfer assets to another Incognito address
      </Text>
      <Text includeFontPadding={false} style={styles.text}>
        Incognito addresses all begin with 12. All parties involved are anonymous, and the transaction is privacy-protected from start to finish.
      </Text>
      <Text style={styles.title}>Want to send assets to an external address?</Text>
      <Text includeFontPadding={false} style={styles.text}>
        Use the Unshield function on the main Assets screen to exit the Incognito network. Unshielding turns your assets public again.
      </Text>
    </ScrollView>
  );
};

export default React.memo(WhySend);
