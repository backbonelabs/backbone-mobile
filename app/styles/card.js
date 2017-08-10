import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: applyWidthDifference(8),
    padding: applyWidthDifference(16),
    shadowColor: 'black', // iOS only
    shadowOffset: { height: applyWidthDifference(1) },
    shadowOpacity: 0.12, // iOS only
    shadowRadius: applyWidthDifference(6), // iOS only
  },
});
