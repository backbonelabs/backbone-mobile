import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  button: {
    width: '100%',
    padding: '1rem',
    justifyContent: 'center',
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
