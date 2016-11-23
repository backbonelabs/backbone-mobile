import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  innerContainer: {
    alignItems: 'center',
    marginTop: 50 * heightDifference,
  },
  inputContainer: {
    marginBottom: 15 * heightDifference,
    width: '90%',
    alignSelf: 'center',
  },
  inputField: {
    width: '90%',
  },
  currentPassword: {
    width: '90%',
    marginBottom: 20 * heightDifference,
  },
  saveButton: {
    marginTop: 40 * heightDifference,
  },
});
