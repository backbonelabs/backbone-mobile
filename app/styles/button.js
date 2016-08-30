import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0.5rem',
    backgroundColor: '$primaryColor',
  },
  disabled: {
    backgroundColor: '$disabledColor',
  },
  text: {
    color: 'white',
    fontSize: '1rem',
    textAlign: 'center',
  },
});
