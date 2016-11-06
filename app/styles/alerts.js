import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

export default EStyleSheet.create({
  backgroundImage: {
    width: 375 * relativeDimensions.widthDifference,
    height: 667 * relativeDimensions.heightDifference,
  },
  spacerContainer: {
    flex: 0.09,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  vibrationContainer: {
    flex: 0.08,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  vibrationText: {
    flex: 0.5,
    alignItems: 'flex-start',
    paddingLeft: 10,
  },
  vibrationSwitch: {
    flex: 0.5,
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  vibrationSettingsContainer: {
    flex: 0.39,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  vibrationStrengthContainer: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vibrationStrengthText: {
    flex: 0.4,
    width: 325,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  vibrationStrengthSlider: {
    flex: 0.25,
    width: 325,
    justifyContent: 'center',
  },
  vibrationStrengthSliderText: {
    flex: 0.35,
    width: 325,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  vibrationPatternContainer: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vibrationPatternText: {
    flex: 0.4,
    width: 325,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  vibrationPatternSlider: {
    flex: 0.25,
    width: 325,
    justifyContent: 'center',
  },
  vibrationPatternSliderText: {
    flex: 0.35,
    width: 325,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  batteryLifeWarningContainer: {
    flex: 0.36,
    alignItems: 'center',
  },
  batteryLifeWarningText: {
    color: 'black',
    fontSize: 13,
    paddingTop: 15,
    paddingHorizontal: 5,
  },
});
