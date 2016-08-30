import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  inputFieldContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    marginBottom: '.5rem',
    marginTop: '.5rem',
  },
  inputField: {
    fontSize: '1rem',
    ...Platform.select({
      ios: {
        height: '1.5rem',
      },
    }),
  },
});
