import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, heightDifference, fixedResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
  },
  inputField: {
    flex: 1,
    fontSize: fixedResponsiveFontSize(18),
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
    height: 84 * heightDifference,
    resizeMode: 'contain',
    marginBottom: 40 * heightDifference,
  },
  confirmationMessageText: {
    textAlign: 'center',
  },
});
