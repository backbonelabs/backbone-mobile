import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    marginTop: '10%',
  },
  learnMoreButton: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyticsContainer: {
    flex: 0.7,
    backgroundColor: 'rgba(0,0,0,0.68)',
  },
  buttonContainer: {
    flex: 0.3,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
  },
  button: {
    color: '$primaryColor',
  },
});
