import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference, heightDifference, fixedResponsiveFontSize } = relativeDimensions;
const responsiveWidthHalfCircle = applyWidthDifference(128.5);

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
    alignSelf: 'center',
    alignItems: 'center',
    height: '$pointerBaseHeight * 2',
    bottom: '$pointerBaseHeight',
    marginBottom: '$pointerBaseHeight * -2',
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
