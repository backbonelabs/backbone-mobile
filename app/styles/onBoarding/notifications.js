import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    width: '100%',
  },
  imageContainer: {
    flex: 0.35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subTextContainer: {
    flex: 0.22,
    width: '65%',
    alignSelf: 'center',
    justifyContent: 'flex-start',
  },
  subText: {
    textAlign: 'center',
  },
  buttonContainer: {
    flex: 0.27,
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
  },
});
