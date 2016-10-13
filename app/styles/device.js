import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    marginTop: '$totalNavHeight',
  },
  deviceName: {
    color: 'white',
    fontSize: '1.25rem',
  },
  deviceID: {
    marginTop: '0.5rem',
    fontSize: '0.5rem',
  },
  spinner: {
    flex: 1,
    justifyContent: 'center',
  },
  spinnerText: {
    marginTop: '0.5rem',
    textAlign: 'center',
  },
});
