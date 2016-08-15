import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flex: 0.60,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'rgba(0,0,0,0.8)',
  },
  body: {
    flex: 0.29,
    justifyContent: 'flex-start',
    // backgroundColor: 'rgba(0,0,0,0.5)',
  },
  footer: {
    flex: 0.11,
    alignItems: 'center',
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
});
