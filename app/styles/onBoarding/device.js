import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    width: '100%',
  },
  headerTextContainer: {
    flex: 0.35,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  subTextContainer: {
    flex: 0.10,
    width: '75%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  subText: {
    textAlign: 'center',
  },
  imageContainer: {
    flex: 0.25,
    justifyContent: 'center',
  },
  primaryButtonContainer: {
    flex: 0.3,
  },
  primaryButton: {
    height: 50,
    width: '80%',
    backgroundColor: '$primaryColor',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  primaryButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});
