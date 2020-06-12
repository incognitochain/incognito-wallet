import { StyleSheet } from 'react-native';
import { COLORS, FONT, SPACING } from '@src/styles';

export const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    marginTop: 42,
  },
});

export const networkItemStyle = StyleSheet.create({
  activeItem: {
    opacity: 1,
  },
  container: {
    flex: 1,
    opacity: 0.3,
    flexDirection: 'row',
    marginBottom: 30
  },
  editContainer: {
    marginBottom: SPACING.large,
    paddingHorizontal: SPACING.small,
  },
  iconContainer: {
    alignItems: 'center',
    flexBasis: 60,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  infoContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  networkName: {
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 4,
    color: COLORS.black,
    fontFamily: FONT.NAME.bold,
    marginBottom: 10,
  },
  networkAddr: {
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 3,
    color: COLORS.colorGreyBold,
    fontFamily: FONT.NAME.medium,
  },
  textInfoContainer: {
    flex: 1,
    width: '100%',
    marginLeft: 15,
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.black,
    marginTop: 8,
  },
});
