import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

export default EStyleSheet.create({
  btnContainer: {
    width: '85%',
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-around',
  },
  monitorBtn: {
    width: applyWidthDifference(75),
    height: applyWidthDifference(75),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    ...Platform.select({
      ios: {
        shadowOffset: {
          width: 0,
          height: 1,
        },
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
    marginTop: applyWidthDifference(14),
    fontSize: fixedResponsiveFontSize(14),
    fontWeight: 'bold',
  },
});
