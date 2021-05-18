import React, { memo } from 'react';
import {FlatList, ScrollView, Text, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '@screens/Home/features/Convert/Convert.styled';
import { ActivityIndicator } from '@components/core';
import { Icon } from 'react-native-elements';
import { COLORS, FONT } from '@src/styles';
import { ScreenHeight, ScreenWidth } from '@utils/devices';

const ConvertStep = (props) => {
  const { steps, currentStep } = props;
  const flatListRef = React.useRef(null);

  const renderStep = ({ item }) => {
    const { key, name, success } = item;
    let statusColor = success === undefined ? COLORS.black : success ? COLORS.green4 : COLORS.red;
    return (
      <View style={styles.log} key={key}>
        {currentStep === key ? <ActivityIndicator style={styles.logIcon} size="small" /> : (
          <Icon
            containerStyle={styles.logIcon}
            color={statusColor}
            size={12}
            name="checkbox-blank-circle"
            type="material-community"
          />
        )}
        <Text
          style={[
            styles.disabledText,
            { width: ScreenWidth * 0.7 },
            { fontFamily: FONT.NAME.medium }]}
        >
          {name}
        </Text>
      </View>
    );
  };

  const handleScrollStep = () => {
    if(!currentStep || !steps || !flatListRef.current) return;
    const index = steps.findIndex(step => step.key === currentStep);
    flatListRef.current.scrollToIndex({animated: true, index: index});
  };

  React.useEffect(() => {
    handleScrollStep();
  }, [currentStep, steps]);

  return(
    <View style={{ marginTop: 30, flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={steps}
        renderItem={renderStep}
        keyExtractor={(item) => item.key}
      />
    </View>
  );
};

ConvertStep.propTypes = {
  loading: PropTypes.bool.isRequired,
  steps: PropTypes.array,
  currentStep:  PropTypes.string.isRequired,
};

ConvertStep.defaultProps = {
  steps: []
};

export default memo(ConvertStep);
