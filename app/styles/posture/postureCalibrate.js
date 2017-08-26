import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
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
    height: applyWidthDifference(200),
    width: applyWidthDifference(200),
  },
  actionsContainer: {
    alignItems: 'center',
  },
});
