import React from 'react';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { SectionItem as Item } from '@screens/Setting/features/Section';

const StakeSection = () => {
  const navigation = useNavigation();
  const itemsFactories = {
    title: 'Staking Pool',
    desc: 'Recover staking account',
    handlePress: () => navigation.navigate(routeNames.StakeRecoverAccount),
  };

  return <Item data={itemsFactories} />;
};

StakeSection.propTypes = {};

export default StakeSection;
