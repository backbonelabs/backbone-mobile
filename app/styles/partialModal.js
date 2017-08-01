import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';
// import theme from './theme';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  $iconSize: fixedResponsiveFontSize(40),
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  innerContainer: {
    flex: undefined,
    backgroundColor: '#FFFFFF',
    padding: applyWidthDifference(10),
    width: applyWidthDifference(340),
    borderRadius: 10,
    elevation: 5,
  },
  buttonContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 8,
  },
  button: {
    width: applyWidthDifference(300),
  },
  closeIcon: {
    color: '$primaryFontColor',
  },
});
