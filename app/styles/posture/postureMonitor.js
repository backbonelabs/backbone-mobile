import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  timer: {
    textAlign: 'center',
    marginBottom: 5 * heightDifference,
  },
  heading: {
    textAlign: 'center',
    marginBottom: 45 * heightDifference,
  },
  monitor: {
    width: 275 * widthDifference,
    height: 138 * heightDifference,
    alignSelf: 'center',
    backgroundColor: 'red',
    borderTopLeftRadius: 275,
    borderTopRightRadius: 275,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    position: 'relative',
  },
  monitorPointWrapper: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: 0,
    height: 0,
  },
  monitorPoint: {
    width: 10,
    height: 10,
    borderRadius: 25,
    backgroundColor: 'black',
    left: -51,
    top: -5,
  },
  monitorHand: {
    position: 'absolute',
    left: -47,
    bottom: 0,
    width: 2,
    height: 85,
    backgroundColor: 'black',
  },
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
    marginBottom: 55 * heightDifference,
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
});
