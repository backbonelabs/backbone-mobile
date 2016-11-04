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
  backBoneLogoWrapper: {
    marginTop: 80 * heightDifference,
    marginBottom: 16 * heightDifference,
    alignSelf: 'center',
  },
  backboneLogo: {
    width: 80 * widthDifference,
    height: 74 * heightDifference,
  },
  loginHeading: {
    textAlign: 'center',
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
  loginButton: {
    alignSelf: 'center',
  },
  forgotPasswordWrapper: {
    marginTop: 10 * heightDifference,
    alignSelf: 'center',
  },
  resetSubHeading: {
    marginTop: 26 * heightDifference,
    textAlign: 'center',
    alignSelf: 'center',
  },
  resetInput: {
    width: 340 * widthDifference,
    marginTop: 43 * heightDifference,
    marginBottom: 144 * heightDifference,
  },
  resetButton: {
    alignSelf: 'center',
    marginBottom: 7 * heightDifference,
  },
  signupHeading: {
    marginTop: 6 * heightDifference,
    alignSelf: 'center',
    textAlign: 'center',
  },
  signupInput: {
    width: 340 * widthDifference,
  },
  signupBtn: {
    alignSelf: 'center',
  },
  signupBackBtn: {
    alignSelf: 'center',
    marginTop: 19 * heightDifference,
    marginBottom: 51 * heightDifference,
  },
  signupEmailContainer: {
    marginTop: 59 * heightDifference,
    marginBottom: 34 * heightDifference,
    alignItems: 'center',
  },
  signupPasswordContainer: {
    marginBottom: 85 * heightDifference,
    alignItems: 'center',
  },
  warning: {
    color: '$primaryColor',
  },
});
