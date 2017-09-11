import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingBottom: applyWidthDifference(30),
  },
  spinner: {
    paddingBottom: applyWidthDifference(20),
  },
  expansionState: {
    fontSize: fixedResponsiveFontSize(18),
    textAlign: 'center',
  },
  expansionProgress: {
    fontSize: fixedResponsiveFontSize(16),
    paddingTop: fixedResponsiveFontSize(5),
    textAlign: 'center',
  },
  buttonContainer: {
    paddingTop: applyWidthDifference(15),
  },
});
