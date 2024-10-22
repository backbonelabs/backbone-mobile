import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '$grey100',
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flex: 0.5,
    paddingHorizontal: applyWidthDifference(20),
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  buttonContainer: {
    flex: 0.5,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    width: '80%',
    paddingBottom: applyWidthDifference(20),
  },
  favoriteButton: {
    color: '$red500',
    fontSize: fixedResponsiveFontSize(40),
  },
});
