import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  deviceName: {
    color: 'white',
    fontSize: '1.25rem',
  },
  deviceID: {
    marginTop: '0.5rem',
    fontSize: '0.5rem',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  deviceInfoBodyText: {
    marginTop: 20,
  },
  deviceInfoSecondaryText: {
    marginTop: 5,
    color: '$primaryFontColor',
  },
});
