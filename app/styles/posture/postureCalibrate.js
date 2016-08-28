import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    marginTop: '10%',
  },
  calibrateContainer: {
    flex: 0.7,
    flexDirection: 'row',
  },
  calibrateCountdown: {
    color: 'white',
    fontSize: '10rem',
    textAlign: 'center',
  },
  calibrateImage: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  calibrateAnimation: {
    width: 5,
    backgroundColor: 'rgba(144,178,71,1)',
    marginRight: '-2%',
  },
  buttonContainer: {
    flex: 0.3,
    justifyContent: 'space-around',
  },
});
