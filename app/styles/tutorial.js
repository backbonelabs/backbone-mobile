import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;

const stepButton = {
  flex: 0.25,
  height: 65 * heightDifference,
  justifyContent: 'center',
};

export default EStyleSheet.create({
  container: {
    flex: 1,
    marginTop: '10%',
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
    width: 50 * widthDifference,
    height: 65 * heightDifference,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previousStepButton: {
    ...stepButton,
    alignItems: 'flex-start',
    paddingLeft: '10%',
  },
  nextStepButton: {
    ...stepButton,
    alignItems: 'flex-end',
    paddingRight: '10%',
  },
  paginationIcon: {
    width: 25 * widthDifference,
    color: 'rgba(0,0,0,0.25)',
  },
});
