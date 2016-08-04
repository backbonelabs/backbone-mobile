import {
  Dimensions,
  StyleSheet,
} from 'react-native';

export default StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
  },
  menuIcon: {
    marginLeft: 25,
  },
  statusBar: {
    height: 25,
    marginTop: -23,
    backgroundColor: '#48BBEC',
  },
  menuButton: {
    height: 75,
    justifyContent: 'center',
    width: Dimensions.get('window').width,
  },
});
