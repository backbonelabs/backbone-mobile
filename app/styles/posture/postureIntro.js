import { StyleSheet } from 'react-native';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-around',
  },
  image: {
    height: applyWidthDifference(240),
    width: applyWidthDifference(240),
  },
  button: {
    width: '100%',
  },
});
