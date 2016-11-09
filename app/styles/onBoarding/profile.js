import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

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
    marginHorizontal: 15 * relativeDimensions.widthDifference,
    alignItems: 'center',
  },
  genderText: {
    marginTop: 5 * relativeDimensions.heightDifference,
    textAlign: 'center',
  },
  genderIcon: {
    width: 50 * relativeDimensions.widthDifference,
    height: 50 * relativeDimensions.heightDifference,
  },
  nicknameInput: {
    width: '41%',
    height: 50 * relativeDimensions.heightDifference,
  },
  profileBodyContainer: {
    flex: 0.33,
    alignSelf: 'center',
    justifyContent: 'space-around',
  },
  profileField: {
    height: '7%',
    width: '65%',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 15 * relativeDimensions.widthDifference,
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
  button: {
    alignSelf: 'center',
  },
  profilePickerContainer: {
    flex: 0.42,
  },
  profilePickerItemsContainer: {
    flexDirection: 'row',
  },
  profilePickerHeader: {
    height: 50 * relativeDimensions.heightDifference,
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: '$primaryColor',
  },
  profilePickerHeaderText: {
    color: 'white',
  },
  profilePickerItems: {
    flex: 0.65,
  },
  profilePickerMetric: {
    flex: 0.35,
  },
  profilePickerHeaderButton: {
    flex: 1,
    paddingHorizontal: 15 * relativeDimensions.widthDifference,
    marginRight: 5 * relativeDimensions.widthDifference,
    justifyContent: 'center',
  },
});
