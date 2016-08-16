import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  header: {
    height: '12%',
    marginBottom: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  deviceContainer: {
    height: '20%',
    borderColor: 'white',
    alignItems: 'center',
    borderBottomWidth: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  deviceName: {
    color: 'white',
    fontSize: '1.25rem',
  },
  deviceID: {
    marginTop: '0.5rem',
    fontSize: '0.5rem',
  },
  numberOfDevices: {
    color: 'white',
    fontSize: '1rem',
    textAlign: 'center',
  },
  title: {
    color: 'white',
    fontSize: '1.25rem',
    marginTop: '2rem',
    textAlign: 'center',
  },
  body: {
    height: '88%',
  },
  footer: {
    flex: 1,
  },
  rescanButton: {
    flex: 0.2,
    justifyContent: 'flex-end',
  },
  button: {
    height: 75,
    width: '100%',
    justifyContent: 'center',
    backgroundColor: '$primaryColor',
  },
  rescan: {
    color: 'white',
    fontSize: '1rem',
    textAlign: 'center',
  },
});
