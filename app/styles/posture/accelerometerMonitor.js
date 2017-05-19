import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartContainer: {
    width: applyWidthDifference(350),
    height: applyWidthDifference(350),
    backgroundColor: '$bannerColor',
    alignItems: 'center',
  },
  chart: {
    alignSelf: 'center',
    justifyContent: 'center',
  },
});
