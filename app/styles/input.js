import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  $placeholderTextColor: '#A9A9A9',
  $color: '#231F20',
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputField: {
    color: '$color',
    fontSize: '1rem',
    borderColor: '#979797',
    borderWidth: 1,
    borderRadius: 5,
    width: 235,
    height: 39,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  icon: {
    position: 'relative',
    right: 20,
  },
  disabled: {
    color: '$disabledColor',
  },
});
