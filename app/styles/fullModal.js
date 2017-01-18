import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, heightDifference, fixedResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  $iconSize: fixedResponsiveFontSize(40),
  container: {
    flex: 1,
    paddingHorizontal: applyWidthDifference(10),
    paddingVertical: 10 * heightDifference,
  },
  buttonContainer: {
    alignItems: 'flex-end',
  },
  closeIcon: {
    color: '$primaryFontColor',
  },
});
