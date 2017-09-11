import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, getResponsiveFontSize } = relativeDimensions;

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
    fontSize: getResponsiveFontSize(18),
    textAlign: 'center',
    marginHorizontal: applyWidthDifference(10),
  },
  expansionProgress: {
    fontSize: getResponsiveFontSize(16),
    paddingTop: applyWidthDifference(5),
    textAlign: 'center',
  },
  buttonContainer: {
    paddingTop: applyWidthDifference(15),
  },
});
