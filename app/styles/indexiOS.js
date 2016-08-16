import { Dimensions } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 2,
    flexDirection: 'row',
  },
  statusBar: {
    backgroundColor: '$primaryColor',
    borderColor: 'blue',
    borderWidth: 3
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
