import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    marginTop: '$totalNavHeight',
  },
  animationContainer: {
    flex: 0.7,
    flexDirection: 'row',
  },
  calibrationCountdown: {
    color: 'white',
    fontSize: '10rem',
    textAlign: 'center',
  },
  calibrationImage: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  calibrationScanAnimation: {
    width: 5,
    backgroundColor: 'rgba(144,178,71,1)',
    marginRight: '-2%',
  },
  buttonContainer: {
    flex: 0.3,
    justifyContent: 'space-around',
  },
});
