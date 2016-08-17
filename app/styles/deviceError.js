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
    flex: 0.11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subFooter: {
    flex: 0.09,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    width: '100%',
    height: 75,
    justifyContent: 'center',
    backgroundColor: '$primaryColor',
  },
  errorCode: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: '1rem',
    textAlign: 'center',
  },
  retry: {
    color: 'white',
    fontSize: '1rem',
    alignSelf: 'center',
  },
  forgetDevice: {
    fontSize: '0.75rem',
    marginLeft: '2%',
  },
});
