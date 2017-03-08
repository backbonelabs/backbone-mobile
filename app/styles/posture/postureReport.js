import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    textAlign: 'center',
    paddingBottom: 25 * heightDifference,
    marginTop: 30 * heightDifference,
  },
});
