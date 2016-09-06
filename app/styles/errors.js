import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flex: 0.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 0.2,
    justifyContent: 'flex-start',
  },
  footer: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    flex: 0.3,
    width: '100%',
    height: 75,
    justifyContent: 'center',
    backgroundColor: '$primaryColor',
  },
  secondaryButton: {
    flex: 0.7,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  errorMessage: {
    fontSize: '1rem',
    textAlign: 'center',
  },
});
