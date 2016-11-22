import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { heightDifference } = relativeDimensions;

const input = {
  width: '90%',
  backgroundColor: '#FFF',
  borderWidth: 0,
  borderBottomWidth: 2,
  borderTopWidth: 2,
  borderColor: 'black',
  borderRadius: 0,
};

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
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
    ...input,
  },
  currentPassword: {
    ...input,
    marginBottom: 20 * heightDifference,
  },
  saveButton: {
    marginTop: 40 * heightDifference,
  },
});
