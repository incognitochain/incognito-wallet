import { StyleSheet } from 'react-native';
import { COLORS } from '@src/styles';
import { isIOS } from '@src/utils/platform';

export const homeStyle = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: isIOS() ? 70 : 100,
  },
  submitBtn: {
    marginTop: 50,
    backgroundColor: COLORS.colorBlue,
  },
});
