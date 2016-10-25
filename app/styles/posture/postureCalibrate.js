import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  textContainer: {
    flex: 0.3,
    width: '75%',
    alignSelf: 'center',
  },
  headingText: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  secondaryText: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calibrationCircleContainer: {
    flex: 0.2,
    width: '60%',
    alignSelf: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  calibrationCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'red',
  },
  image: {
    flex: 0.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
