import { StyleSheet } from 'react-native';
import { COLORS, FONT } from '@src/styles';

export const styled = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
  },
  scrollview: {
  },
  text: {
    fontFamily: FONT.NAME.specialMedium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.medium + 4,
  },
  icon: {
    marginTop: 2,
    marginRight: 8,
  },
  contentView: {
    flexDirection: 'row',
    marginHorizontal: 10,
  },
  selectedButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  button: {
    marginTop: 30,
    marginBottom: 200
  },
  warning: {
    paddingHorizontal: 15,
  },
  warningText: {
    fontFamily: FONT.NAME.regular,
    fontSize: 16,
    lineHeight: 20,
    color: COLORS.orange,
  },
  labelText: {
    marginRight: 20,
    color: COLORS.colorGreyBold
  },
  labelTextActive: {
    marginRight: 20,
    color: COLORS.black
  },
});
