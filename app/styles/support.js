import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

export default EStyleSheet.create({
  inputField: {
    flex: 1,
    fontSize: '1rem',
    paddingHorizontal: 10 * relativeDimensions.widthDifference,
    textAlignVertical: 'top', // Android
  },
  confirmationMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationMessageImage: {
    width: 80 * relativeDimensions.widthDifference,
    height: 84 * relativeDimensions.heightDifference,
    resizeMode: 'contain',
    marginBottom: 40 * relativeDimensions.heightDifference,
  },
  confirmationMessageText: {
    textAlign: 'center',
  },
});
