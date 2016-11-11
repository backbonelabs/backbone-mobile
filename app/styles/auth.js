import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContainer: {
    width: '90%',
  },
  backboneLogo: {
    alignSelf: 'center',
    width: 80 * widthDifference,
    height: 74 * heightDifference,
    resizeMode: 'contain',
  },
  headingText: {
    textAlign: 'center',
    marginVertical: 16 * heightDifference,
  },
  subHeadingText: {
    textAlign: 'center',
  },
  formContainer: {
    paddingVertical: 30 * heightDifference,
  },
  inputFieldContainer: {
    marginBottom: 30 * heightDifference,
  },
  inputField: {
    width: '90%',
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
