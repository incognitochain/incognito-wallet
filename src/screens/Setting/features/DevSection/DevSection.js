import React from 'react';
import { Text, TouchableOpacity, Switch } from '@components/core/index';
import Section, { sectionStyle } from '@screens/Setting/features/Section';
import LocalDatabase from '@utils/LocalDatabase';
import RNRestart from 'react-native-restart';
import { AsyncStorage } from 'react-native';

const DevSection = () => {
  const [homeConfig] = React.useState(global.homeConfig);

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

  const isStagingConfig = homeConfig === 'staging';

  console.debug('HOME CONFIG', homeConfig);

  return (
    <Section
      label="Dev Tools"
      customItems={[
        <TouchableOpacity
          key="home-config"
          onPress={toggleHomeConfig}
          style={sectionStyle.subItem}
        >
          <Text style={sectionStyle.desc}>Use staging home config</Text>
          <Switch onValueChange={toggleHomeConfig} value={isStagingConfig} />
        </TouchableOpacity>,
        <TouchableOpacity
          key="uniswap-tooltip"
          onPress={resetUniswapTooltip}
          activeOpacity={0.5}
          style={[sectionStyle.subItem, { marginTop: 10 }]}
        >
          <Text style={sectionStyle.desc}>Reset uniswap tooltip</Text>
        </TouchableOpacity>,
      ]}
    />
  );
};

DevSection.propTypes = {};

export default DevSection;
