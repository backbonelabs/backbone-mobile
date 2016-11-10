import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  inputField: {
    flex: 1,
    fontSize: '1rem',
    textAlignVertical: 'top', // Android
  },
  confirmationMessageContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  confirmationMessageText: {
    textAlign: 'center',
  },
});
