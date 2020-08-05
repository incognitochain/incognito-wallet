import { COLORS, FONT } from '@src/styles';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    marginBottom: 100,
  },
  listContainer: {
    marginTop: 40,
  },
  wrapper: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  title: {
    paddingVertical: 15,
    fontSize: 20,
    borderBottomWidth: 1,
    borderColor: COLORS.lightGrey5,
    ...FONT.STYLE.medium,
  },
});
