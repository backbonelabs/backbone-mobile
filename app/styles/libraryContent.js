import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, getResponsiveFontSize, noScale } = relativeDimensions;

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
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    color: '$red500',
    fontSize: noScale(getResponsiveFontSize(40)),
  },
});
