import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  innerContainer: {
    alignItems: 'center',
    marginTop: applyWidthDifference(50),
  },
  inputContainer: {
    marginBottom: applyWidthDifference(15),
    width: '90%',
    alignSelf: 'center',
  },
  inputField: {
    width: '90%',
  },
  newPassword: {
    marginTop: applyWidthDifference(15),
  },
  saveButton: {
    marginTop: applyWidthDifference(40),
    width: '90%',
  },
  warning: {
    color: '$primaryColor',
    height: applyWidthDifference(20),
  },
  passwordText: {
    marginTop: applyWidthDifference(40),
    paddingHorizontal: applyWidthDifference(20),
  },
});
