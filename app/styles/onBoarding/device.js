import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    width: '100%',
  },
  headerTextContainer: {
    flex: 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subTextContainer: {
    flex: 0.20,
    width: '75%',
    alignSelf: 'center',
    justifyContent: 'flex-start',
  },
  subText: {
    textAlign: 'center',
  },
  primaryButtonContainer: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'center',
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
