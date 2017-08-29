import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-around',
  },
  image: {
    height: applyWidthDifference(180),
    width: applyWidthDifference(180),
    '@media (min-height: 481)': {
      height: applyWidthDifference(240),
      width: applyWidthDifference(240),
    },
  },
});
