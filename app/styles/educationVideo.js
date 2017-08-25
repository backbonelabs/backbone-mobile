import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F5F5F5',
    paddingTop: applyWidthDifference(45),
  },
  videoContainer: {
    flex: 2,
    justifyContent: 'center',
  },
  buttonContainer: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favouriteButton: {
    color: '#F44336',
    fontSize: fixedResponsiveFontSize(40),
  },
});
