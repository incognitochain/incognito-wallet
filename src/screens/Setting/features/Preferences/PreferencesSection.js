import React from 'react';
import { Icon } from 'react-native-elements';
import Section from '@screens/Setting/features/Section';

const PreferencesSection = () => {
  const items = [
    {
      title: 'Language',
      desc: 'English',
      icon: <Icon type='material' name='language' size={24} />,
      handlePress: null
    }
  ];
  return (
    <Section
      label='Preferences'
      items={items}
    />
  );
};

PreferencesSection.propTypes = {
};

export default PreferencesSection;