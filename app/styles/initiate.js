import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    marginTop: 125,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 300,
    height: 300,
  },
  button: {
    height: 75,
    width: 275,
    marginTop: 150,
    borderRadius: 4,
    justifyContent: 'center',
    backgroundColor: '$primaryColor',
  },
  buttonText: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
});
