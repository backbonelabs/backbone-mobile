import { Dimensions } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  $iconSize: 40 * widthDifference,
  $windowHeight: Dimensions.get('window').height,
  container: {
    flex: 1,
    width: '100%',
    height: '$windowHeight - $statusBarHeight',
    paddingHorizontal: 10 * widthDifference,
    paddingVertical: 10 * heightDifference,
  },
  buttonContainer: {
    alignItems: 'flex-end',
  },
  closeIcon: {
    color: '$primaryFontColor',
  },
});
