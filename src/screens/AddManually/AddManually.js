import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, TouchableOpacity } from '@src/components/core';
import AddERC20Token from '@src/components/AddERC20Token';
import AddBep2Token from '@src/components/AddBep2Token';
import Icons from 'react-native-vector-icons/Fontisto';
import Header from '@src/components/Header';
import PureModal from '@src/components/Modal/features/PureModal';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { useBackHandler } from '@src/components/UseEffect';
import styles from './AddManually.styled';
import withAddManually, {
  AddManuallyContext,
  TYPES,
} from './AddManually.enhance';
import AddManuallyModal from './AddManually.modal';

const SelectType = () => {
  const { toggleChooseType, type } = React.useContext(AddManuallyContext);
  return (
    <View style={styles.selectType}>
      <View style={styles.selectNetworkButtonGroup}>
        <Text style={[styles.text, styles.boldText]}>Select token type</Text>
        <TouchableOpacity
          onPress={toggleChooseType}
          style={styles.selectNetworkButton}
        >
          <Text style={styles.text}>{type}</Text>
          <Icons
            name="angle-right"
            style={styles.selectNetworkValueIcon}
            size={16}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ModalSelectType = () => {
  const { isShowChooseType, toggleChooseType } = React.useContext(
    AddManuallyContext,
  );
  return (
    <PureModal
      visible={isShowChooseType}
      content={<AddManuallyModal />}
      onRequestClose={toggleChooseType}
    />
  );
};

const AddManually = () => {
  const { type } = React.useContext(AddManuallyContext);
  return (
    <View style={styles.container}>
      <Header title="Add manually" />
      <SelectType />
      <ScrollView style={styles.scrollview}>
        {type === TYPES.BEP2.value && <AddBep2Token />}
        {type === TYPES.ERC20.value && <AddERC20Token />}
      </ScrollView>
      <ModalSelectType />
    </View>
  );
};

AddManually.propTypes = {};

export default withAddManually(AddManually);
