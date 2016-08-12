import { Dimensions } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 2,
    flexDirection: 'row',
    // width: Dimensions.get('window').width,
    // borderColor: 'red',
    // borderWidth: 3
  },
  statusBar: {
    backgroundColor: '$primaryColor',
    borderColor: 'blue',
    borderWidth: 3
    // height: 25,
    // marginTop: -23,
  },
  menuButton: {
    justifyContent: 'center',  
    marginLeft: '5%'
  },
  settingButton: {
    justifyContent: 'center',
    marginRight: '5%'
  },
  menuButtonIcon: {
    fontSize: 30,
    color: '$primaryColor'
  },
  settingButtonIcon: {
    fontSize: 30,
    color: '$primaryColor'
  },

});
