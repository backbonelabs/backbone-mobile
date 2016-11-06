import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    flex: 1,
    alignSelf: 'center',
    width: '90%',
  },
  postureThreshold: {
    marginTop: '5%',
  },
  vibrationContainer: {
    flex: 0.6,
    flexDirection: 'row',
    marginTop: '5%',
    marginBottom: '5%',
  },
  vibration: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  forget: {
    marginTop: '1rem',
    alignItems: 'center',
  },
});
