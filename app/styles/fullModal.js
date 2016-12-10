import { Dimensions } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, heightDifference, fixedResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  $iconSize: fixedResponsiveFontSize(40),
  $windowHeight: Dimensions.get('window').height,
  container: {
    flex: 1,
    width: '100%',
    height: '$windowHeight - $statusBarHeight',
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
