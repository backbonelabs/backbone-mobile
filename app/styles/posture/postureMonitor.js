import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;
const responsiveWidthHalfCircle = applyWidthDifference(128.5);

const totalPointerWidth = applyWidthDifference(10);
const totalPointerLength = applyWidthDifference(88);

export default EStyleSheet.create({
  $pointerBaseHeight: 84,
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  connectingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectingSpinner: {
    marginBottom: 10,
  },
  connectingText: {
    marginTop: 10,
  },
  timer: {
    textAlign: 'center',
    marginTop: applyWidthDifference(40),
    '@media (max-height: 480)': { // iphone4's max height
      marginTop: applyWidthDifference(10),
    },
    marginBottom: applyWidthDifference(5),
  },
  heading: {
    textAlign: 'center',
    marginBottom: applyWidthDifference(50),
    '@media (max-height: 480)': { // iphone4's max height
      marginBottom: applyWidthDifference(15),
    },
  },
  monitorPointerContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: totalPointerWidth,
    width: (totalPointerLength * 2) - applyWidthDifference(8),
    marginTop: totalPointerWidth * -0.5,
  },
  base: {
    width: applyWidthDifference(8),
    height: applyWidthDifference(8),
    borderRadius: applyWidthDifference(4),
    backgroundColor: '$primaryFontColor',
  },
  hand: {
    height: applyWidthDifference(2),
    width: applyWidthDifference(70),
    backgroundColor: '$primaryFontColor',
  },
  point: {
    backgroundColor: 'transparent',
    borderRightWidth: 0,
    borderTopWidth: applyWidthDifference(5),
    borderLeftWidth: applyWidthDifference(10),
    borderBottomWidth: applyWidthDifference(5),
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderLeftColor: '$primaryFontColor',
    borderBottomColor: 'transparent',
  },
  monitorTitle: {
    textAlign: 'center',
    marginBottom: applyWidthDifference(34),
  },
  monitorRatingContainer: {
    flexDirection: 'row',
    marginTop: applyWidthDifference(5),
    marginBottom: applyWidthDifference(5),
    alignSelf: 'center',
  },
  monitorPoor: {
    marginLeft: applyWidthDifference(26),
    marginRight: applyWidthDifference(212),
  },
  monitorGood: {
    marginRight: applyWidthDifference(27),
  },
  sliderTitle: {
    textAlign: 'center',
    marginBottom: applyWidthDifference(50),
    fontSize: fixedResponsiveFontSize(12),
  },
  btnContainer: {
    width: '85%',
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-around',
  },
  halfCircleOuterContainer: {
    height: responsiveWidthHalfCircle,
    width: (responsiveWidthHalfCircle * 2),
    position: 'absolute',
    top: applyWidthDifference(7.5),
    left: applyWidthDifference(7.5),
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
  partialSpinnerContainer: {
    height: applyWidthDifference(25),
  },
});
