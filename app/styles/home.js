import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    flex: 0.8,
    justifyContent: 'center',
  },
  logo: {
    width: 325,
    height: 54,
  },
  body: {
    flex: 0.11,
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  activityIndicator: {
    color: '$primaryColor',
  },
  footer: {
    flex: 0.09,
    justifyContent: 'center',
  },
  signup: {
    color: 'white',
    fontSize: '0.75rem',
    alignSelf: 'center',
  },
});
