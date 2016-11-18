import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  $fontColor: '#FFFFFF',
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCircle: {
    width: 266 * widthDifference,
    height: 266 * widthDifference,
    resizeMode: 'contain',
  },
  summary: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 266 * widthDifference,
    height: 266 * widthDifference,
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
  time: {
    fontSize: 36,
    '@media (max-width: 320)': { // iphone4's max width
      fontSize: 25,
    },
    color: '$fontColor',
  },
  timeBodyText: {
    color: '$fontColor',
  },
  goal: {
    color: '$fontColor',
  },
  quote: {
    width: 335 * widthDifference,
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
