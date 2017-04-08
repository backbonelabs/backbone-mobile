import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

const border = {
  borderBottomWidth: 1,
  borderColor: '#EEEEEE',
};

const sliderStyle = {
  width: '85%',
  justifyContent: 'center',
};

export default EStyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  spacerContainer: {
    flex: 0.09,
    ...border,
  },
  vibrationContainer: {
    flex: 0.08,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: applyWidthDifference(10),
    ...border,
  },
  vibrationText: {
    flex: 0.85,
  },
  vibrationSwitch: {
    flex: 0.15,
  },
  vibrationSettingsContainer: {
    flex: 0.39,
    ...border,
  },
  sliderContainer: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    flex: 0.25,
    ...sliderStyle,
  },
  sliderText: {
    flex: 0.4,
    alignItems: 'flex-start',
    ...sliderStyle,
  },
  sliderDetails: {
    flex: 0.35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...sliderStyle,
  },
  sliderDetailsText: {
    color: '$primaryFontColor',
  },
  notificationDisabledWarningContainer: {
    alignItems: 'center',
    paddingTop: applyWidthDifference(15),
    paddingHorizontal: applyWidthDifference(5),
  },
  notificationDisabledWarningText: {
    color: '$primaryFontColor',
    fontSize: fixedResponsiveFontSize(14),
    paddingBottom: applyWidthDifference(10),
  },
  batteryLifeWarningContainer: {
    flex: 0.36,
    alignItems: 'center',
    paddingTop: applyWidthDifference(15),
    paddingHorizontal: applyWidthDifference(5),
  },
  batteryLifeWarningText: {
    color: '$primaryFontColor',
    fontSize: fixedResponsiveFontSize(13),
  },
  systemSettingButton: {
    width: applyWidthDifference(200),
  },
});
