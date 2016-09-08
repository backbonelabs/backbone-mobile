import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    marginTop: '$totalNavHeight',
  },
  analyticsContainer: {
    flex: 0.7,
    backgroundColor: 'rgba(0,0,0,0.68)',
  },
  buttonContainer: {
    flex: 0.3,
  },
  rightButton: {
    color: '$primaryColor',
  },
});
