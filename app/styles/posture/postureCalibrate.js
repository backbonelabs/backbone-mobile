import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  $size: applyWidthDifference(200),
  container: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    marginTop: applyWidthDifference(10),
    textAlign: 'center',
  },
  image: {
    alignItems: 'center',
    height: '$size',
    justifyContent: 'center',
    width: '$size',
  },
  blinder: {
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    width: '$size',
  },
  progressText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionsContainer: {
    alignItems: 'center',
  },
});
