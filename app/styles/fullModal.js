import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  $iconSize: fixedResponsiveFontSize(40),
  container: {
    flex: 1,
    paddingHorizontal: applyWidthDifference(10),
    paddingVertical: applyWidthDifference(10),
  },
  buttonContainer: {
    alignItems: 'flex-end',
  },
  closeIcon: {
    color: '$primaryFontColor',
  },
});
