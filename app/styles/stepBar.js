import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  outerCircle: {
    height: applyWidthDifference(20),
    width: applyWidthDifference(20),
    borderRadius: 100,
    borderWidth: applyWidthDifference(1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    height: applyWidthDifference(8),
    width: applyWidthDifference(8),
    borderRadius: 100,
  },
  line: {
    width: applyWidthDifference(50),
    height: applyWidthDifference(1),
  },
});
