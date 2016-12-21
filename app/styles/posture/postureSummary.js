import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference, heightDifference, fixedResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  $starIconSize: fixedResponsiveFontSize(50),
  $fontColor: '#FFFFFF',
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCircle: {
    width: applyWidthDifference(266),
    height: applyWidthDifference(266),
    resizeMode: 'contain',
  },
  summary: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: applyWidthDifference(266),
    height: applyWidthDifference(266),
  },
  summaryInner: {
    flex: 0.50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryOuter: {
    flex: 0.25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goodPostureTime: {
    color: '$fontColor',
  },
  goodPostureTimeBodyText: {
    color: '$fontColor',
  },
  goal: {
    color: '$fontColor',
  },
  quote: {
    width: applyWidthDifference(335),
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: 70 * heightDifference,
  },
  starWrap: {
    position: 'absolute',
    top: -100,
    backgroundColor: 'transparent',
  },
});
