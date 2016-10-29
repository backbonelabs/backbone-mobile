import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    width: '100%',
  },
  headerTextContainer: {
    flex: 0.15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 0.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flex: 0.45,
    justifyContent: 'center',
  },
  primaryButtonContainer: {
    alignItems: 'center',
  },
  secondaryButtonContainer: {
    alignItems: 'center',
    paddingTop: 15,
  },
  secondaryButton: {
    borderColor: '$primaryColor',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  secondaryButtonText: {
    color: '$primaryColor',
    textAlign: 'center',
  },
});
