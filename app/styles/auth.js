import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    width: 342 * widthDifference,
  },
  backBoneLogo: {
    width: 74 * widthDifference,
    height: 69 * heightDifference,
    alignSelf: 'center',
  },
  backBoneLogoWrapper: {
    marginTop: 106 * heightDifference,
    marginBottom: 16 * heightDifference,
    marginLeft: 125 * widthDifference,
    marginRight: 120 * widthDifference,
    alignSelf: 'center',
    width: 95 * widthDifference,
    height: 88 * heightDifference,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 9,
    paddingLeft: 11,
  },
  loginHeading: {
    width: 350 * widthDifference,
    height: 27 * heightDifference,
    textAlign: 'center',
    fontSize: '1.375rem',
    color: '#231F20',
  },
  emailInput: {
    width: 340 * widthDifference,
    marginTop: 57 * heightDifference,
    marginBottom: 34 * heightDifference,
  },
  passwordInput: {
    width: 340 * widthDifference,
    marginBottom: 101 * heightDifference,
  },
  backButton: {
    alignSelf: 'center',
    marginBottom: 26 * heightDifference,
  },
  loginButton: {
    alignSelf: 'center',
  },
  forgotPasswordWrapper: {
    marginTop: 8 * heightDifference,
    marginBottom: 24 * heightDifference,
    width: 350 * widthDifference,
    height: 16 * heightDifference,
    alignSelf: 'center',
  },
  forgotPassword: {
    color: '#A9A9A9',
    fontSize: '.75rem',
    textAlign: 'center',
    marginLeft: 100 * widthDifference,
    marginRight: 98 * heightDifference,
  },
});
