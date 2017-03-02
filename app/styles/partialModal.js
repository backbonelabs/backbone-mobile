import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';
import theme from './theme';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  $iconSize: fixedResponsiveFontSize(40),
  outerContainer: {
    flex: 1,
    marginTop: theme.totalNavHeight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  innerContainer: {
    flex: undefined,
    backgroundColor: '#FFFFFF',
    padding: applyWidthDifference(10),
    width: applyWidthDifference(300),
  },
  buttonContainer: {
    alignItems: 'flex-end',
  },
  closeIcon: {
    color: '$primaryFontColor',
  },
  bodyText: {
    textAlign: 'center',
  },
  buttonView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: applyWidthDifference(10),
  },
  button: {
    width: applyWidthDifference(125),
  },
});
