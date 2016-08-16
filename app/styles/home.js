import EStyleSheet from 'react-native-extended-stylesheet';
import { Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');

export default EStyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    flex: 0.8,
    justifyContent: 'center',
  },
  logo: {
    width: 325,
    height: 54,
  },
  body: {
    flex: 0.11,
  },
  background: {
    position: 'absolute',
    width,
    height,
  },
  button: {
    width,
    height: 75,
    justifyContent: 'center',
    backgroundColor: '$primaryColor',
  },
  connect: {
    color: 'white',
    fontSize: '1rem',
    alignSelf: 'center',
  },
  footer: {
    flex: 0.09,
    justifyContent: 'center',
  },
  signup: {
    color: 'white',
    fontSize: '0.75rem',
    alignSelf: 'center',
  },
});
