import React from 'react';
import {Text, ScrollView, View} from '@src/components/core';
import Header from '@src/components/Header';
import styles from './style';

const NodeHelp = () => {
  return (
    <View style={styles.container}>
      <Header title="Need help?" />
      <ScrollView>
        <Text style={[styles.title, styles.marginTop]}>
        IMPORTANT NOTES
        </Text>
        <View>
          <Text style={styles.title}>
          Wi-Fi only
          </Text>
          <Text style={styles.text}>
          During set up, mobile data for Android (or cellular, for iOS) should be switched off. You can do this from your device settings. You should remain connected to Wi-Fi. This is to prevent switching between networks, which may cause setup to fail. After setup, feel free to turn mobile data back on.
          </Text>
          <Text style={[styles.marginTop, styles.text]}>
          Of course, please make sure your home Wi-Fi details are correct. If your home Wi-Fi doesn’t show up in the list of networks, please restart your phone and try again.
          </Text>
        </View>
        <View>
          <Text style={styles.title}>
          Enable location access
          </Text>
          <Text style={styles.text}>
          This step is needed to help Node find your home Wi-Fi.
          </Text>
        </View>
        <View style={{ paddingBottom: 100, marginTop: 20 }}>
          <Text style={styles.title}>
          TROUBLESHOOT
          </Text>
          <Text style={[styles.title, styles.text]}>
          What to do if you encounter one of the following error messages:
          </Text>
          <Text style={[styles.marginTop, styles.text]}>
            <Text style={styles.bold}>
            Case 1 - Unable connect to Node-xxx:&nbsp;&nbsp;
            </Text>
          If the corresponding network Node-xxxx does not appear in your list of networks on your first attempt, unplug the device and plug it in again. You may need to do this a few times.
          </Text>
          <Text style={[styles.marginTop, styles.text]}>
            <Text style={styles.bold}>
          Case 2 - Network error:&nbsp;&nbsp;
            </Text>
          Make sure your Wi-Fi is working, and that your connection is stable. Then try again. In case your wifi network is unstable, find a more stable one, and choose to forget pasword of the current wifi in order to prevent networks switching back & forth which will lead to setup failure.
          </Text>
          <Text style={[styles.marginTop, styles.text]}>
            <Text style={styles.bold}>
          Case 3 - Send validator key failed:&nbsp;&nbsp;
            </Text>
          Please make sure your Mobile data is off, and your phone is less than 1 meter away from the node.
          </Text>
          <Text style={[styles.marginTop, styles.text]}>
            <Text style={styles.bold}>
          Case 4 - Verify code error:&nbsp;&nbsp;
            </Text>
          Make sure your Wi-Fi is working. If it is, then please make sure the password was entered correctly.
          </Text>
          <Text style={[styles.marginTop, styles.text]}>
            <Text style={styles.bold}>
            Case 5 -&nbsp;
            </Text>
          If setup failed, but you saw&nbsp;
            <Text style={styles.semiBold}>&apos;Verify code success&apos;</Text> &&nbsp;
            <Text style={styles.semiBold}>&apos;Authenticate firebase success&apos;</Text>&nbsp;
          messages at step 4, then go back to the first step, scan the QR code again, and proceed as instructed. If you see &apos;You’ve already set up this node&apos;, try adding the QR code manually.
          </Text>
          <Text style={[styles.marginTop, styles.text]}>
          Still stuck? We’re here to help. Contact us at go@incognito.org
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default React.memo(NodeHelp);
