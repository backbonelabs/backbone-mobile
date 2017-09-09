import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const {
  applyWidthDifference,
  getResponsiveFontSize,
  noScale,
} = relativeDimensions;

export default EStyleSheet.create({
  $placeholderTextColor: '$grey500',
  $iconColor: '$primaryFontColor',
  $iconSize: '$inputIconSize',
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
    fontSize: noScale(getResponsiveFontSize(14)),
    width: '85%',
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
    color: '$grey500',
  },
  disabled: {
    color: '$disabledColor',
  },
});
