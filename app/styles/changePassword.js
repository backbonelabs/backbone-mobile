import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';
import theme from '../styles/theme';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

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
    borderColor: theme.lightBlueColor,
  },
  newPassword: {
    marginTop: applyWidthDifference(15),
  },
  saveButton: {
    marginTop: applyWidthDifference(40),
    backgroundColor: theme.lightBlueColor,
    width: '90%',
  },
  warning: {
    color: '$primaryColor',
    height: applyWidthDifference(20),
    fontSize: fixedResponsiveFontSize(12),
  },
  passwordText: {
    marginTop: applyWidthDifference(40),
    paddingHorizontal: applyWidthDifference(20),
  },
});
