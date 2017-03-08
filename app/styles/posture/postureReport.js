import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    textAlign: 'center',
    paddingVertical: applyWidthDifference(25),
  },
});
