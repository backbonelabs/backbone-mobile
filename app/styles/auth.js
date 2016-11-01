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
  backButton: {
    alignSelf: 'center',
    marginBottom: 27 * heightDifference,
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
    textAlign: 'center',
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
  nevermindWrapper: {
    marginBottom: 94 * heightDifference,
    width: 350 * widthDifference,
    height: 16 * heightDifference,
    alignSelf: 'center',
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
