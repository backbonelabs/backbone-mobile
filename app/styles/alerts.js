import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

const border = {
  borderBottomWidth: 1,
  borderColor: '#EEEEEE',
};

export default EStyleSheet.create({
  container: {
    width: '100%',
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
    backgroundColor: 'white',
    ...Platform.select({
      // OS-specific drop shadow styling
      ios: {
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowRadius: 4,
        shadowOpacity: 0.15,
      },
      android: {
        elevation: 2,
      },
    }),
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
    paddingVertical: applyWidthDifference(15),
    ...border,
  },
  notificationDisabledWarningText: {
    color: '$warningColor',
    marginBottom: applyWidthDifference(10),
  },
  batteryLifeWarningContainer: {
    flex: 0.36,
    paddingBottom: applyWidthDifference(15),
    paddingHorizontal: applyWidthDifference(15),
  },
  systemSettingButton: {
    width: applyWidthDifference(200),
  },
  slouchContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 0.02,
    flexDirection: 'row',
    paddingLeft: applyWidthDifference(15),
    paddingRight: applyWidthDifference(10),
    paddingBottom: applyWidthDifference(15),
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  picker: {
    ...Platform.select({
      android: {
        marginLeft: applyWidthDifference(11),
        marginRight: applyWidthDifference(10),
      },
    }),
  },
});
