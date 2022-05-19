import React from 'react';
import { SectionItem as Section } from '@screens/Setting/features/Section';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@routers/routeNames';
import { ConvertIcon } from '@components/Icons';

const RemoveOldPool = () => {
  const navigation = useNavigation();
  const onPressItem = () => {
    navigation.navigate(routeNames.LiquidityVer1);
  };
  return (
    <ErrorBoundary>
      <Section
        data={{
          title: 'Withdraw liquidity',
          desc: 'Withdraw liquidity added before pDEX v3',
          handlePress: onPressItem,
          icon: <ConvertIcon />
        }}
      />
    </ErrorBoundary>
  );
};

RemoveOldPool.propTypes = {};

export default React.memo(RemoveOldPool);
