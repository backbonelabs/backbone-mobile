import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    marginTop: 100,
    marginBottom: 50,
  },
  button: {
    height: 75,
    width: 300,
    borderRadius: 4,
    justifyContent: 'center',
    backgroundColor: '$primaryColor',
  },
  buttonText: {
    fontSize: '2rem',
    color: 'white',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  disabledButton: {
    height: 75,
    width: 300,
    borderRadius: 4,
    justifyContent: 'center',
    backgroundColor: '$disabledColor',
  },
});
