import { Dimensions } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 2,
    // width: Dimensions.get('window').width,
    flexDirection: 'row',
    // borderColor: 'red',
    // borderWidth: 3
  },
  menuIcon: {
    // marginLeft: 25,
  },
  statusBar: {
    // height: 25,
    // marginTop: -23,
    backgroundColor: '$primaryColor',
    borderColor: 'blue',
    borderWidth: 3
  },
  menuButton: {
    // height: 75,
    justifyContent: 'center',  
    marginLeft: '5%'
    // width: Dimensions.get('window').width,
  },

  settingButton: {
   // height: 75,
    justifyContent: 'center',
    marginRight: '5%'
    // width: Dimensions.get('window').width,
    // borderColor: 'green',
    // borderWidth: 3
  },

});
