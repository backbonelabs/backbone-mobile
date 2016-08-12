import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 300,
    height: 50,
  },
  button: {
    width: 300,
    height: 60,
    marginTop: 25,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$primaryColor',
  },
  buttonText: {
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  connectingText: {
    color: 'white',
    fontSize: '1.5rem',
    marginLeft: 10,
  },
  modalBodyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalBodyContent: {
    width: 150,
    height: 100,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  modalBodyTitle: {
    color: 'red',
    fontSize: '1.5rem',
    marginTop: 10,
  },
});
