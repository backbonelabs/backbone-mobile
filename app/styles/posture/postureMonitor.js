import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference, heightDifference, fixedResponsiveFontSize } = relativeDimensions;
const responsiveWidthHalfCircle = applyWidthDifference(128.5);

const totalPointerWidth = applyWidthDifference(10);
const totalPointerLength = applyWidthDifference(88);

export default EStyleSheet.create({
  $sliderIconSize: fixedResponsiveFontSize(15),
  $sliderIconPadding: applyWidthDifference(5),
  $pointerBaseHeight: 84,
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
    width: `${totalPointerLength * 2} - ${applyWidthDifference(8)}`,
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
    marginBottom: 34 * heightDifference,
  },
  monitorRatingContainer: {
    flexDirection: 'row',
    marginTop: 5 * heightDifference,
    marginBottom: 5 * heightDifference,
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
    alignSelf: 'center',
    width: applyWidthDifference(296),
  },
  sliderContainer: {
    width: applyWidthDifference(296),
    marginBottom: 50 * heightDifference,
    alignSelf: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  btnContainer: {
    width: applyWidthDifference(350),
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-around',
  },
  monitorBtn: {
    width: applyWidthDifference(75),
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
});
