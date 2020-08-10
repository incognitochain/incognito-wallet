import { StyleSheet } from 'react-native';
import { COLORS, FONT } from '@src/styles';

const style = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    marginBottom: 15,
  },
  containerDetail: {
    backgroundColor: COLORS.white,
    marginBottom: 15,
    padding: 20,
    paddingTop: 0,
    flex: 1
  },
  item: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingTop: 10
  }
});

export default style;
