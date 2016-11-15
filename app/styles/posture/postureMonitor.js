import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  $pointerBaseHeight: 84,
  container: {
    flex: 1,
  },
  timer: {
    textAlign: 'center',
    marginTop: 43 * heightDifference,
    marginBottom: 5 * heightDifference,
  },
  heading: {
    textAlign: 'center',
    marginBottom: 50 * heightDifference,
  },
  animationContainer: {
    height: '$pointerBaseHeight * 2',
    bottom: '$pointerBaseHeight',
    marginBottom: '$pointerBaseHeight * -2',
  },
  monitorPointerContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    height: '$pointerBaseHeight * 2',
    marginBottom: '$pointerBaseHeight',
    transform: [{ rotate: '90deg' }],
  },
  base: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '$primaryFontColor',
  },
  hand: {
    width: 2,
    height: 70,
    backgroundColor: '$primaryFontColor',
  },
  point: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftWidth: 5,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '$primaryFontColor',
    borderLeftColor: 'transparent',
  },
  monitorTitle: {
    textAlign: 'center',
    marginBottom: 34 * heightDifference,
  },
  monitorRatingContainer: {
    flexDirection: 'row',
    marginTop: 5 * heightDifference,
    marginBottom: 5 * heightDifference,
    alignSelf: 'center',
  },
  monitorPoor: {
    marginLeft: 26 * widthDifference,
    marginRight: 212 * widthDifference,
  },
  monitorGood: {
    marginRight: 27 * widthDifference,
  },
  sliderTitle: {
    textAlign: 'center',
    alignSelf: 'center',
    width: 296 * widthDifference,
  },
  sliderContainer: {
    width: 296 * widthDifference,
    marginBottom: 50 * heightDifference,
    alignSelf: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  btnContainer: {
    width: 350 * widthDifference,
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-around',
  },
  monitorBtn: {
    width: 75 * widthDifference,
    height: 75 * heightDifference,
    resizeMode: 'contain',
  },
  btnText: {
    textAlign: 'center',
    marginTop: 14 * heightDifference,
  },
});
