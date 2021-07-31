import { useState, useCallback, useMemo } from 'react';
import Toast from '@components/core/Toast/Toast';
import { useFocusEffect } from 'react-navigation-hooks';
import { getFunctionConfigs } from '@services/api/misc';

export const getDurationShowMessage = (message) => {
  message = message || '';
  return Math.max(Math.floor(message.length / 15) * 1000, 2000);
};

export const handleGetFunctionConfigs = async (featureName) => {
  let result = {};
  try {
    const features = await getFunctionConfigs();
    if (features && features.length) {
      return (
        features.find((featureItem) => featureItem.name === featureName) || {}
      );
    }
  } catch (e) {
    console.debug('CAN NOT GET FEATURE', featureName, e);
  }
  return result;
};

function useFeatureConfig(featureName, onPress) {
  const [feature, setFeature] = useState({});
  const handlePress = useCallback(
    (...params) => {
      if (feature && feature?.disabled && global.homeConfig !== 'staging') {
        const duration = getDurationShowMessage(feature.message);
        return Toast.showInfo(feature.message, {
          duration,
        });
      }

      if (typeof onPress === 'function') {
        return onPress(...params);
      }
    },
    [onPress, feature],
  );

  const isDisabled = useMemo(() => {
    if (global.homeConfig === 'staging') return false;
    if (feature && feature?.disabled) {
      return feature?.disabled;
    }

    return false;
  }, [feature]);

  const getFeature = async () => {
    try {
      const feature = await handleGetFunctionConfigs(featureName);
      setFeature(feature);
    } catch (e) {
      console.debug('CAN NOT GET FEATURE', featureName, e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getFeature();
    }, [featureName]),
  );

  return [handlePress, isDisabled, feature?.message];
}

export default useFeatureConfig;
