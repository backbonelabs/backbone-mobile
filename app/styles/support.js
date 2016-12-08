import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  background: {
    height: '100%',
    width: '100%',
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 10 * widthDifference,
    textAlignVertical: 'top', // Android
  },
  confirmationMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationMessageImage: {
    width: 80 * widthDifference,
    height: 84 * heightDifference,
    resizeMode: 'contain',
    marginBottom: 40 * heightDifference,
  },
  confirmationMessageText: {
    textAlign: 'center',
  },
});
