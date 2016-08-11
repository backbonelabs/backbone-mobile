import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 300,
    height: 50,
    marginTop: 100,
    marginBottom: 100,
  },
  button: {
    height: 75,
    width: 300,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$primaryColor',
  },
  buttonText: {
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  disabled: {
    height: 75,
    width: 300,
    borderRadius: 4,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '$disabledColor',
  },
  connectingText: {
    color: 'white',
    fontSize: '1.5rem',
    marginLeft: 10,
  },
});
