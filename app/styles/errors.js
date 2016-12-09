import EStyleSheet from 'react-native-extended-stylesheet';

const relativeCenter = {
  alignItems: 'center',
  justifyContent: 'center',
};

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flex: 0.6,
    ...relativeCenter,
  },
  body: {
    flex: 0.2,
    justifyContent: 'flex-start',
  },
  footer: {
    flex: 0.2,
    ...relativeCenter,
  },
  primaryButton: {
    flex: 0.3,
    width: '100%',
    height: 75,
    justifyContent: 'center',
    backgroundColor: '$primaryColor',
  },
  secondaryButton: {
    flex: 0.7,
    flexDirection: 'row',
    ...relativeCenter,
  },
  errorMessage: {
    textAlign: 'center',
  },
  primaryText: {
    color: 'white',
    alignSelf: 'center',
  },
  secondaryText: {
    marginLeft: '2%',
  },
});
