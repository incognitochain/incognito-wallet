import React from 'react';
import { Text, TouchableOpacity, Switch } from '@components/core/index';
import Section, { sectionStyle } from '@screens/Setting/features/Section';
import LocalDatabase from '@utils/LocalDatabase';
import RNRestart from 'react-native-restart';
import { AsyncStorage } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { useDispatch, useSelector } from 'react-redux';
import {
  devSelector,
  actionToggleTestModeDecentralized,
  actionToggleTestModeCentralized,
  // actionToggleUTXOs,
} from '@src/screens/Dev';
import { CONSTANT_KEYS } from '@src/constants';

const DevSection = () => {
  const [homeConfig] = React.useState(global.homeConfig);
  const navigation = useNavigation();
  const dev = useSelector(devSelector);
  const dispatch = useDispatch();
  const resetUniswapTooltip = async () => {
    await LocalDatabase.resetViewUniswapTooltip();
    RNRestart.Restart();
  };

  const toggleHomeConfig = async () => {
    await AsyncStorage.setItem(
      'home-config',
      homeConfig === 'staging' ? 'production' : 'staging',
    );
    RNRestart.Restart();
  };

  const onNavUserProfile = () => navigation.navigate(routeNames.Profile);

  const onToggleTestModeDecentralized = () =>
    dispatch(actionToggleTestModeDecentralized());

  const onToggleTestModeCentralized = () =>
    dispatch(actionToggleTestModeCentralized());

  // const onToggleUTXOs = () => dispatch(actionToggleUTXOs());

  const isStagingConfig = homeConfig === 'staging';

  const customItems = [
    {
      id: 'home-config',
      onPress: toggleHomeConfig,
      toggleSwitch: true,
      switchComponent: (
        <Switch onValueChange={toggleHomeConfig} value={isStagingConfig} />
      ),
      desc: 'Use staging home config',
    },
    {
      id: 'uniswap-tooltip',
      onPress: resetUniswapTooltip,
      desc: 'Reset uniswap tooltip',
    },
    {
      id: 'user-profile',
      onPress: onNavUserProfile,
      desc: 'User profile',
    },
    {
      id: 'decentralized',
      desc: 'Toggle test mode decentralized',
      onPress: null,
      toggleSwitch: true,
      switchComponent: (
        <Switch
          onValueChange={onToggleTestModeDecentralized}
          value={dev[CONSTANT_KEYS.DEV_TEST_MODE_DECENTRALIZED]}
        />
      ),
    },
    {
      id: 'centralized',
      desc: 'Toggle test mode centralized',
      onPress: null,
      toggleSwitch: true,
      switchComponent: (
        <Switch
          onValueChange={onToggleTestModeCentralized}
          value={dev[CONSTANT_KEYS.DEV_TEST_MODE_CENTRALIZED]}
        />
      ),
    },
    // {
    //   id: 'streamline',
    //   desc: 'Toggle streamline UTXOs',
    //   onPress: null,
    //   toggleSwitch: true,
    //   switchComponent: (
    //     <Switch
    //       onValueChange={onToggleUTXOs}
    //       value={dev[CONSTANT_KEYS.DEV_TEST_TOGGLE_UTXOS]}
    //     />
    //   ),
    // },
  ];

  return (
    <Section
      label="Dev Tools"
      customItems={customItems.map((item, index) => (
        <TouchableOpacity
          key={item?.id}
          onPress={item?.onPress}
          style={[sectionStyle.subItem, index !== 0 ? { marginTop: 10 } : null]}
        >
          <Text style={sectionStyle.desc}>{item?.desc}</Text>
          {!!item?.toggleSwitch && item?.switchComponent}
        </TouchableOpacity>
      ))}
    />
  );
};

DevSection.propTypes = {};

export default DevSection;
