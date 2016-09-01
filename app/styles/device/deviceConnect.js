import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    marginTop: '10%',
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  deviceName: {
    color: 'white',
    fontSize: '1.25rem',
  },
  deviceID: {
    marginTop: '0.5rem',
    fontSize: '0.5rem',
  },
});
