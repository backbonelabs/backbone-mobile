import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';
import theme from '../styles/theme';

const {
  applyWidthDifference,
  fixedResponsiveFontSize,
} = relativeDimensions;

export default EStyleSheet.create({
  outerContainer: {
    backgroundColor: 'rgba(52, 52, 52, 0.7)',
    height: '100%',
    alignItems: 'center',
  },
  innerContainer: {
    borderRadius: applyWidthDifference(5),
    backgroundColor: 'white',
    marginTop: applyWidthDifference(270),
    width: '90%',
  },
  titleContainer: {
    paddingTop: applyWidthDifference(10),
    width: '90%',
  },
  title: {
    textAlign: 'center',
  },
  confirmButton: {
    marginTop: applyWidthDifference(6),
    padding: applyWidthDifference(8),
    paddingTop: applyWidthDifference(12),
  },
  confirmText: {
    textAlign: 'center',
    padding: applyWidthDifference(12),
    color: '#2196F3',
    fontWeight: '900',
    fontSize: fixedResponsiveFontSize(18),
  },
  cancelButton: {
    marginTop: applyWidthDifference(15),
    width: '90%',
    backgroundColor: 'white',
    borderRadius: applyWidthDifference(5),
    padding: applyWidthDifference(8),
  },
  cancelText: {
    padding: applyWidthDifference(12),
    textAlign: 'center',
    fontWeight: '500',
    backgroundColor: 'transparent',
    fontSize: fixedResponsiveFontSize(18),
  },
  profilePicker: {
    height: applyWidthDifference(200),
  },
});
