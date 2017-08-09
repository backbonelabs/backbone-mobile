import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

const border = {
  borderBottomWidth: 1,
  borderColor: '#EEEEEE',
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
  vibrationSettingsContainer: {
    flex: 0.39,
    ...border,
  },
  sliderContainer: {
    flex: 0.5,
    justifyContent: 'center',
    marginVertical: applyWidthDifference(15),
  },
  slider: {
    flex: 0.25,
    justifyContent: 'center',
    paddingHorizontal: applyWidthDifference(15),
    width: '100%',
  },
  sliderThumb: {
    width: applyWidthDifference(20),
    height: applyWidthDifference(20),
    backgroundColor: '#396600',
    top: applyWidthDifference(25),
  },
  sliderTrack: {
    height: applyWidthDifference(10),
    borderRadius: 8,
    backgroundColor: '#d8d8d8',
  },
  sliderText: {
    flex: 0.4,
    alignItems: 'flex-start',
    paddingHorizontal: applyWidthDifference(15),
    justifyContent: 'center',
    width: '100%',
  },
  sliderDetails: {
    flex: 0.35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: applyWidthDifference(15),
    width: '100.0%',
  },
  sliderDetailsText: {
    color: '$primaryFontColor',
  },
  notificationDisabledWarningContainer: {
    alignItems: 'center',
    paddingTop: applyWidthDifference(12),
    paddingBottom: applyWidthDifference(15),
    paddingHorizontal: applyWidthDifference(5),
    ...border,
  },
  notificationDisabledWarningText: {
    color: '$primaryFontColor',
    fontSize: fixedResponsiveFontSize(14),
    paddingBottom: applyWidthDifference(10),
  },
  batteryLifeWarningContainer: {
    flex: 0.36,
    paddingBottom: applyWidthDifference(15),
    paddingHorizontal: applyWidthDifference(15),
  },
  batteryLifeWarningText: {
    color: '$primaryFontColor',
    fontSize: fixedResponsiveFontSize(13),
  },
  systemSettingButton: {
    width: applyWidthDifference(200),
  },
});
