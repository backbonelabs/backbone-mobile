import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const {
  applyWidthDifference,
  fixedResponsiveFontSize,
} = relativeDimensions;

export default EStyleSheet.create({
  $placeholderTextColor: '#9E9E9E',
  $iconColor: '$primaryFontColor',
  $iconSize: '$inputIconSize',
  container: {
    alignItems: 'center',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowRadius: 3,
        shadowOpacity: 0.15,
      },
      android: {
        elevation: 2,
      },
    }),
    borderRadius: 3,
  },
  inputField: {
    color: '$primaryFontColor',
    fontFamily: '$primaryFont',
    fontSize: fixedResponsiveFontSize(16),
    width: applyWidthDifference(235),
    height: applyWidthDifference(50),
    paddingHorizontal: applyWidthDifference(45),
    paddingVertical: applyWidthDifference(10),
    borderColor: '$secondaryColor',
    borderRadius: 3,
  },
  icon: {
    position: 'absolute',
    fontSize: '$inputIconSize',
    left: applyWidthDifference(15),
    color: '#9E9E9E',
  },
  disabled: {
    color: '$disabledColor',
  },
});
