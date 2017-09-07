import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference, getResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    alignSelf: 'center',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-around',
    width: '95%',
  },
  text: {
    fontSize: getResponsiveFontSize(14),
    textAlign: 'center',
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
