import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  $progressBarHeight: applyWidthDifference(20),
  container: {
    alignItems: 'center',
  },
  progressBarOuter: {
    backgroundColor: 'gray',
    borderRadius: '$progressBarHeight * 0.5',
    height: '$progressBarHeight',
    width: '90%',
  },
  progressBarInner: {
    backgroundColor: 'blue',
    borderRadius: '$progressBarHeight * 0.5',
    height: '$progressBarHeight',
    width: '100%',
  },
  progressBarStepIndicators: {
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    top: '0 - $progressBarHeight',
  },
  stepIndicator: {
    width: '$progressBarHeight',
    height: '$progressBarHeight',
  },
});
