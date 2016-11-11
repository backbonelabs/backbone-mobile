import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { widthDifference, heightDifference } = relativeDimensions;

export default EStyleSheet.create({
  container: {
    width: '100%',
  },
  textContainer: {
    flex: 0.08,
    alignItems: 'center',
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
    marginHorizontal: 15 * widthDifference,
    alignItems: 'center',
  },
  genderText: {
    marginTop: 5 * heightDifference,
    textAlign: 'center',
  },
  genderIcon: {
    width: 50 * widthDifference,
    height: 50 * heightDifference,
    resizeMode: 'contain',
  },
  nicknameInput: {
    width: '41%',
    height: 50 * heightDifference,
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
    paddingLeft: 15 * widthDifference,
    borderColor: '#979797',
    justifyContent: 'center',
  },
  completedProfileField: {
    width: '58%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileFieldIcon: {
    color: '$primaryFontColor',
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
    height: 50 * heightDifference,
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
    paddingHorizontal: 15 * widthDifference,
    marginRight: 5 * widthDifference,
    justifyContent: 'center',
  },
});
