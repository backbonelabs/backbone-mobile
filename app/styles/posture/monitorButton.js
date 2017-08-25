import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  monitorBtn: {
    width: applyWidthDifference(75),
    height: applyWidthDifference(75),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: applyWidthDifference(75 / 2),
    ...Platform.select({
      ios: {
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowColor: '$secondaryFontColor',
        shadowRadius: 2,
        shadowOpacity: 0.3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  btnText: {
    textAlign: 'center',
    marginTop: applyWidthDifference(8),
    fontWeight: 'bold',
  },
});
