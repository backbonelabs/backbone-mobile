import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    marginTop: 23,
  },
  progressCircleContainer: {
    flex: 0.1,
    width: '50%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onBoardingFlowContainer: {
    flex: 0.9,
    flexDirection: 'row',
  },
});
