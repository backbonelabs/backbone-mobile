import EStyleSheet from 'react-native-extended-stylesheet';

const textDefaults = {
  flex: 0.5,
  alignItems: 'center',
};

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  textContainer: {
    flex: 0.33,
    width: '65%',
    alignSelf: 'center',
  },
  headingText: {
    flex: 0.6,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  secondaryText: {
    flex: 0.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calibrationCircleContainer: {
    flex: 0.2,
    width: '44%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  calibrationCircle: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: 'red',
  },
  image: {
    flex: 0.47,
    alignItems: 'center',
  },
});
