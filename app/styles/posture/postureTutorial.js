import EStyleSheet from 'react-native-extended-stylesheet';

const stepButton = {
  flex: 0.25,
  height: 65,
  justifyContent: 'center',
};

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
    width: 15,
    color: '$primaryColor',
  },
  stepIndicatorButton: {
    width: 50,
    height: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previousStepButton: Object.assign({}, stepButton,
    {
      alignItems: 'flex-start',
      paddingLeft: '10%',
    }
  ),
  nextStepButton: Object.assign({}, stepButton,
    {
      alignItems: 'flex-end',
      paddingRight: '10%',
    }
  ),
  paginationIcon: {
    width: 25,
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
