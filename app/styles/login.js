import EStyleSheet from 'react-native-extended-stylesheet';
import { Dimensions } from 'react-native';

export default EStyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    width: '90%',
  },
  activityIndicator: {
    color: '$primaryColor',
  },
  textField: {
    fontSize: '1.5rem',
    height: '2rem',
  },
  textFieldView: {
    borderColor: 'black',
    borderBottomWidth: 1,
    marginTop: 10,
    marginBottom: 10,
  },
  button: {
    height: '3rem',
    marginTop: 20,
    borderRadius: '$buttonBorderRadius',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$primaryColor',
  },
  buttonText: {
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
});
