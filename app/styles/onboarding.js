import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    marginTop: 23,
  },
  progressBarContainer: {
    flex: 0.15,
    width: '50%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '$primaryColor',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onBoardingFlowContainer: {
    flex: 0.85,
    flexDirection: 'row',
  },
});
