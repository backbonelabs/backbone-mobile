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
    height: 266 * heightDifference,
  },
  summary: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 266 * widthDifference,
    height: 266 * heightDifference,
    marginTop: 60 * heightDifference,
  },
  time: {
    fontSize: 36,
    color: '$fontColor',
  },
  timeBodyText: {
    color: '$fontColor',
    marginBottom: 60 * heightDifference,
  },
  goal: {
    color: '$fontColor',
  },
  quote: {
    width: 335 * widthDifference,
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: 70,
  },
  starWrap: {
    position: 'absolute',
    top: -50,
    backgroundColor: 'transparent',
  },
});
