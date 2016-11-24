import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;
const responsiveWidthHalfCircle = 128.5 * widthDifference;

const totalPointerWidth = 10 * widthDifference;
const totalPointerLength = 88 * widthDifference;

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  timer: {
    textAlign: 'center',
    marginTop: 40 * heightDifference,
    '@media (max-height: 480)': { // iphone4's max height
      marginTop: 10 * heightDifference,
    },
    marginBottom: 5 * heightDifference,
  },
  heading: {
    textAlign: 'center',
    marginBottom: 50 * heightDifference,
    '@media (max-height: 480)': { // iphone4's max height
      marginBottom: 15 * heightDifference,
    },
  },
  monitorPointerContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: totalPointerWidth,
    width: `${totalPointerLength * 2} - ${8 * widthDifference}`,
    marginTop: totalPointerWidth * -0.5,
  },
  base: {
    width: 8 * widthDifference,
    height: 8 * widthDifference,
    borderRadius: 4 * widthDifference,
    backgroundColor: '$primaryFontColor',
  },
  hand: {
    height: 2 * widthDifference,
    width: 70 * widthDifference,
    backgroundColor: '$primaryFontColor',
  },
  point: {
    backgroundColor: 'transparent',
    borderRightWidth: 0,
    borderTopWidth: 5 * widthDifference,
    borderLeftWidth: 10 * widthDifference,
    borderBottomWidth: 5 * widthDifference,
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderLeftColor: '$primaryFontColor',
    borderBottomColor: 'transparent',
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
  halfCircleOuterContainer: {
    height: responsiveWidthHalfCircle,
    width: (responsiveWidthHalfCircle * 2),
    position: 'absolute',
    top: 7.5 * widthDifference,
    left: 7.5 * widthDifference,
    alignSelf: 'center',
    alignItems: 'center',
    borderWidth: 0,
    overflow: 'hidden',
  },
  halfCircleInnerContainer: {
    height: responsiveWidthHalfCircle * 2,
    width: responsiveWidthHalfCircle * 2,
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'flex-end',
    alignSelf: 'center',
    alignItems: 'center',
  },
  halfCircle: {
    height: responsiveWidthHalfCircle,
    width: responsiveWidthHalfCircle * 2,
    borderBottomLeftRadius: responsiveWidthHalfCircle * 2,
    borderBottomRightRadius: responsiveWidthHalfCircle * 2,
    backgroundColor: '#FFF',
  },
});
