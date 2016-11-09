import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const border = {
  borderBottomWidth: 1,
  borderColor: '#EEEEEE',
};

const sliderStyle = {
  width: 325 * relativeDimensions.widthDifference,
  justifyContent: 'center',
};

export default EStyleSheet.create({
  backgroundImage: {
    width: 375 * relativeDimensions.widthDifference,
    height: 667 * relativeDimensions.heightDifference,
  },
  spacerContainer: Object.assign({ flex: 0.09 }, border),
  vibrationContainer: Object.assign({
    flex: 0.08,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10 * relativeDimensions.widthDifference,
  }, border),
  vibrationText: {
    flex: 0.85,
  },
  vibrationSwitch: {
    flex: 0.15,
  },
  vibrationSettingsContainer: Object.assign({ flex: 0.39 }, border),
  sliderContainer: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: Object.assign({ flex: 0.25 }, sliderStyle),
  sliderText: Object.assign({ flex: 0.4, alignItems: 'flex-start' }, sliderStyle),
  sliderDetails: Object.assign({
    flex: 0.35,
    flexDirection: 'row',
    justifyContent: 'space-between',
  }, sliderStyle),
  sliderDetailsText: {
    color: '$primaryFontColor',
  },
  batteryLifeWarningContainer: {
    flex: 0.36,
    alignItems: 'center',
    paddingTop: 15 * relativeDimensions.heightDifference,
    paddingHorizontal: 5 * relativeDimensions.widthDifference,
  },
  batteryLifeWarningText: {
    color: '$primaryFontColor',
    fontSize: 13,
  },
});
