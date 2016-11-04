import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  innerContainer: {
    width: 342 * widthDifference,
    paddingTop: 80 * heightDifference,
  },
  backboneLogo: {
    alignSelf: 'center',
    width: 80 * widthDifference,
    height: 74 * heightDifference,
  },
  headingText: {
    textAlign: 'center',
    marginVertical: 16 * heightDifference,
  },
  subHeadingText: {
    textAlign: 'center',
  },
  formContainer: {
    marginTop: 30 * heightDifference,
  },
  inputFieldContainer: {
    marginBottom: 30 * heightDifference,
  },
  inputField: {
    width: 340 * widthDifference,
  },
  CTAContainer: {
    marginVertical: 16 * heightDifference,
  },
  CTAButton: {
    alignSelf: 'center',
  },
  forgotPassword: {
    textAlign: 'center',
  },
  warning: {
    color: '$primaryColor',
    textAlign: 'center',
  },
});
