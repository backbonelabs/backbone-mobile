import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, getResponsiveFontSize, noScale } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
  },
  inputField: {
    flex: 1,
    fontSize: noScale(getResponsiveFontSize(12)),
    paddingHorizontal: applyWidthDifference(10),
    textAlignVertical: 'top', // Android
  },
  confirmationMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationMessageImage: {
    width: applyWidthDifference(80),
    height: applyWidthDifference(84),
    resizeMode: 'contain',
    marginBottom: applyWidthDifference(40),
  },
  confirmationMessageText: {
    textAlign: 'center',
  },
});
