import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;

export default EStyleSheet.create({
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
    marginBottom: 45 * heightDifference,
  },
  monitor: {
    width: 275 * widthDifference,
    height: 135 * heightDifference,
    alignSelf: 'center',
    backgroundColor: 'red',
    borderTopLeftRadius: 275,
    borderTopRightRadius: 275,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 4,
  },
  monitorPointer: {
    alignSelf: 'center',
    marginTop: 40 * heightDifference,
  },
  base: {
    width: 10,
    height: 10,
    borderRadius: 25,
    backgroundColor: 'black',
  },
  hand: {
    width: 3,
    height: 60,
    backgroundColor: 'black',
    left: 3,
    top: 1,
  },
  point: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderRightWidth: 6,
    borderBottomWidth: 12,
    borderLeftWidth: 6,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'black',
    borderLeftColor: 'transparent',
    right: 1.5,
    top: 1,
  },
  // spinner: {
  //   top: 110,
  // },
  monitorTitle: {
    textAlign: 'center',
    marginBottom: 34 * heightDifference,
  },
  monitorRatingContainer: {
    flexDirection: 'row',
    marginTop: 6 * heightDifference,
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
  },
  sliderContainer: {
    width: 296 * widthDifference,
    marginBottom: 50 * heightDifference,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  btnContainer: {
    marginBottom: 72 * heightDifference,
    width: 350 * widthDifference,
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-around',
  },
  monitorBtn: {
    width: 76 * widthDifference,
    height: 75 * heightDifference,
  },
  btnText: {
    textAlign: 'center',
    marginTop: 14 * heightDifference,
  },
});
