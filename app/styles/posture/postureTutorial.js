import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  stepContainer: {
    flex: 0.9,
    flexDirection: 'row',
  },
  stepNavigationContainer: {
    flex: 0.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicatorContainer: {
    flex: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stepIndicator: {
    color: '$primaryColor',
  },
  stepIndicatorButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previousStepButton: {
    flex: 0.25,
    height: 50,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  nextStepButton: {
    flex: 0.25,
    height: 50,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  previousStep: {
    marginLeft: '5%',
    color: 'rgba(0,0,0,0.25)',
  },
  nextStep: {
    marginRight: '5%',
    color: 'rgba(0,0,0,0.25)',
  },
  stepOne: {
    width: '100%',
    backgroundColor: 'red',
  },
  stepTwo: {
    width: '100%',
    backgroundColor: 'orange',
  },
  stepThree: {
    width: '100%',
    backgroundColor: 'yellow',
  },
});
