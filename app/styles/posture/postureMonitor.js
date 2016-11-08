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
    marginBottom: 25 * heightDifference,
  },
  monitorPointer: {
    alignSelf: 'center',
    position: 'relative',
    width: 0,
    height: 0,
    bottom: 75,
  },
  base: {
    width: 8,
    height: 8,
    borderRadius: 25,
    backgroundColor: 'black',
  },
  hand: {
    width: 2,
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
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftWidth: 5,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'black',
    borderLeftColor: 'transparent',
    right: 1,
    top: 1,
  },
  monitorTitle: {
    textAlign: 'center',
    marginBottom: 34 * heightDifference,
  },
  monitorRatingContainer: {
    flexDirection: 'row',
    marginTop: 15 * heightDifference,
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
