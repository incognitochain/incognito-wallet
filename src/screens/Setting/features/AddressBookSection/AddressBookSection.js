/* eslint-disable react-native/no-unused-styles */
import React from 'react';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { HEADER_TITLE_RECEIVERS } from '@src/redux/types/receivers';
import { CONSTANT_KEYS } from '@src/constants';
import { StyleSheet } from 'react-native';
import Section, {
  SectionItem as Item,
} from '@screens/Setting/features/Section';

const styled = StyleSheet.create({
  styleItem: {
    marginBottom: 10,
  },
});

const AddressBookSection = (props) => {
  const navigation = useNavigation();
  const onSelectedItem = ({ info, keySave }) => {
    navigation.navigate(routeNames.FrequentReceiversForm, {
      info: {
        ...info,
        toAddress: info?.address,
      },
      keySave,
      action: 'update',
      headerTitle: 'Edit',
    });
  };
  const handleNavigateFrequentReceivers = ({ keySave, headerTitle, keySync }) =>
    navigation.navigate(routeNames.FrequentReceivers, {
      keySave,
      keySync,
      disabledSwipe: false,
      disabledSelectedAddr: true,
      headerTitle,
      onSelectedItem: (info) => onSelectedItem({ keySave, info }),
    });
  const itemsFactories = [
    {
      desc: HEADER_TITLE_RECEIVERS.SENDIN,
      handlePress: () =>
        handleNavigateFrequentReceivers({
          keySave: CONSTANT_KEYS.REDUX_STATE_RECEIVERS_IN_NETWORK,
          headerTitle: HEADER_TITLE_RECEIVERS.ADDRESS_BOOK,
        }),
      styleItem: styled.styleItem,
    },
    {
      desc: HEADER_TITLE_RECEIVERS.WITHDRAW,
      handlePress: () =>
        handleNavigateFrequentReceivers({
          keySave: CONSTANT_KEYS.REDUX_STATE_RECEIVERS_OUT_NETWORK,
          headerTitle: HEADER_TITLE_RECEIVERS.ADDRESS_BOOK,
        }),
      styleItem: styled.styleItem,
    },
  ];
  return (
    <Section
      label="Address Book"
      customItems={itemsFactories.map((item, key, arr) => (
        <Item data={{ ...item, lastChild: arr.length - 1 === key }} key={key} />
      ))}
    />
  );
};

AddressBookSection.propTypes = {};

export default AddressBookSection;
