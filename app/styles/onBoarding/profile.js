import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    width: '100%',
  },
  textContainer: {
    flex: 0.08,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  text: {
    textAlign: 'center',
  },
  genderSelectionContainer: {
    flex: 0.17,
    width: '75%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gender: {
    margin: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderText: {
    marginTop: 5,
    textAlign: 'center',
  },
  nicknameInput: {
    width: '41%',
    height: 50,
  },
  profileFieldContainer: {
    flex: 0.33,
    alignSelf: 'center',
    justifyContent: 'space-around',
  },
  profileField: {
    height: '7%',
    width: '65%',
    ...Platform.select({
      ios: {
        borderColor: '#979797',
        borderWidth: 1,
        borderRadius: 5,
      },
    }),
    paddingLeft: 15,
    borderColor: '#979797',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  completedProfileField: {
    width: '58%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileFieldIcon: {
    color: '#231F20',
  },
  buttonContainer: {
    flex: 0.42,
    justifyContent: 'center',
  },
  secondaryButton: {
    borderColor: '$primaryColor',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  secondaryButtonText: {
    color: '$primaryColor',
    textAlign: 'center',
  },
  profilePickerContainer: {
    flex: 0.42,
    justifyContent: 'flex-end',
  },
  profilePicker: {
    marginTop: 10,
    marginBottom: -15,
    flexDirection: 'row',
  },
  profilePickerHeader: {
    height: 40,
    marginBottom: -26,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  profilePickerItems: {
    flex: 0.65,
  },
  profilePickerMetric: {
    flex: 0.35,
  },
  profilePickerHeaderButton: {
    flex: 1,
    padding: 15,
    marginRight: 5,
    justifyContent: 'center',
  },
});
