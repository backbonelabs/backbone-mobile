import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  sliderContainer: {
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sliderInnerContainer: {
    flex: 1,
  },
  leftIconStyles: {
    paddingRight: applyWidthDifference(5),
    color: '$secondaryFontColor',
  },
  rightIconStyles: {
    paddingLeft: applyWidthDifference(5),
    color: '$secondaryFontColor',
  },
  thumbStyle: {
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
  trackStyle: {
    height: applyWidthDifference(8),
    backgroundColor: '$disabledColor',
    borderRadius: 8,
  },
});
