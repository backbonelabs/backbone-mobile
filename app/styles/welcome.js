import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;
const width = 330 * widthDifference;

export default EStyleSheet.create({
  $containerMarginPt: 20,
  $heightDifference: heightDifference,
  $widthDifference: widthDifference,
  $topMargin: '$containerMarginPt * $heightDifference',
  container: {
    flex: 1,
    marginTop: '$statusBarHeight + $topMargin',
    marginBottom: '$containerMarginPt * $heightDifference',
    alignItems: 'center',
    alignSelf: 'center',
  },
  body: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    width,
  },
  heading: {
    marginTop: 30,
  },
  caption: {
    marginTop: 26,
  },
  text: {
    textAlign: 'center',
  },
  footer: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    width,
  },
  CTAContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width,
  },
});
