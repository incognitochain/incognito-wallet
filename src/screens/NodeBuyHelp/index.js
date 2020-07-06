import React from 'react';
import { Text, ScrollView, View } from '@src/components/core';
import Header from '@src/components/Header';
import styles from './style';

const Destination = () => {
  return (
    <View style={styles.container}>
      <Header title="" />
      <ScrollView>
        <Text style={[styles.titleHeader, styles.marginTop]}>
          Return & Warranty Policy for Incognito Hardware
        </Text>
        <View>
          <Text style={styles.title}>
            30-day trial (United States only)
          </Text>
          <Text style={styles.text}>
            If you don’t love your Node device, we’ll take it back. Simple as that. Within the first 30 days from the date of delivery, you can return Node for a full refund. We’ll even cover return shipping costs. (For orders paid in cryptocurrencies, refunded amounts will be calculated based on coinmarketcap prices at the time the refund request is approved.)
          </Text>
          <Text style={[styles.marginTop, styles.text]}>
            All returns require An RMA (Return Merchandise Authorization) number, issued by our Customer Service Department.
          </Text>
          <Text style={styles.text}>
            Please email us at <Text style={[styles.text, { textDecorationLine: 'underline', color: 'black' }]}>go@incognito.org</Text> to discuss and obtain our Return Authorization Number. Please do not discard the original boxes and packaging materials; you must return the product in its original packaging.
          </Text>
          <Text style={[styles.marginTop, styles.text]}>
            The RMA number needs to be clearly visible on the exterior of the packaging. Products must be returned (and received by us) within the 30-day trial period, and must be in like-new condition. No refund will be issued if the product has been damaged, altered, or abused. No returns will be processed after 30 days.
          </Text>
        </View>
        <View>
          <Text style={styles.title}>
            1-year warranty (United States only)
          </Text>
          <Text style={styles.text}>
            All shipments should be inspected immediately upon arrival. Please make note of any damage to boxes when signing for shipment. Report any losses or damages promptly to Incognito via email: go@incognito.org. Please notify us of shipping defects within one week of delivery; we will arrange pick up and replacement of the damaged goods.
          </Text>
          <Text style={[styles.marginTop, styles.text]}>
            Our standard warranty is 1 year from the date that the product is received. In the case of manufacturer’s defects, Incognito will cover the full costs of replacement or repair, as well as return shipping costs. `Defects` are defined as imperfections in material or workmanship that will impair the use of the product.
          </Text>
          <Text style={[styles.marginTop, styles.text]}>
            Please return the defective Node device in its original box and with its original accessories – power cord, adapters, documentation and so on. It may take up to (30) days for Incognito to process repairs or replacements.
          </Text>
          <Text style={[styles.marginTop, styles.text]}>
            This warranty is non-transferrable, limited to the original purchaser with proof of purchase. In no event shall Incognito be liable for incidental or consequential
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default React.memo(Destination);
