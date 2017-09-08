import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  $size: applyWidthDifference(200),
  container: {
    backgroundColor: '$grey50',
    flex: 1,
    justifyContent: 'space-between',
  },
  contentContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    color: '$lightBlue500',
  },
  subtitle: {
    marginTop: applyWidthDifference(10),
    textAlign: 'center',
  },
  progressCircle: {
    alignItems: 'center',
    height: '$size',
    justifyContent: 'center',
    marginVertical: applyWidthDifference(14),
    width: '$size',
  },
  blinder: {
    backgroundColor: '$grey50',
    position: 'absolute',
    top: 0,
    width: '$size',
  },
  progressText: {
    backgroundColor: 'transparent',
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    borderRadius: 0,
    width: '100%',
  },
});
