import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'center',
  },
  contentContainer: {
    marginVertical: applyWidthDifference(40),
    justifyContent: 'flex-end',
  },
  spinner: {
    height: applyWidthDifference(15),
    width: applyWidthDifference(15),
  },
  progressContainer: {
    width: applyWidthDifference(215),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: applyWidthDifference(15),
  },
  progressBar: {
    width: applyWidthDifference(190),
  },
  buttonContainer: {
    alignItems: 'center',
  },
});
