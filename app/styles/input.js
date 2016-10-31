import { Platform } from 'react-native';
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
    ...Platform.select({
      ios: {
        borderColor: '#979797',
        borderWidth: 1,
        borderRadius: 5,
      },
    }),
    width: 235,
    height: 39,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  icon: {
    color: '$color',
  },
  disabled: {
    color: '$disabledColor',
  },
});
