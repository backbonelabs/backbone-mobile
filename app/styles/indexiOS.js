import { Dimensions } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
  },
  menuIcon: {
    marginLeft: 25,
  },
  statusBar: {
    height: 25,
    marginTop: -23,
    backgroundColor: '$primaryColor',
  },
  menuButton: {
    height: 75,
    justifyContent: 'center',
    width: Dimensions.get('window').width,
  },
});
