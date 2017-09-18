import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference } = relativeDimensions;

export default EStyleSheet.create({
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  innerContainer: {
    flex: undefined,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: applyWidthDifference(10),
    width: applyWidthDifference(340),
    borderRadius: applyWidthDifference(10),
    ...Platform.select({
      // OS-specific drop shadow styling
      ios: {
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowRadius: 4,
        shadowOpacity: 0.15,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  topView: {
    paddingVertical: applyWidthDifference(20),
  },
  titleText: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginHorizontal: applyWidthDifference(12),
  },
  detailText: {
    textAlign: 'center',
    marginVertical: applyWidthDifference(10),
    marginHorizontal: applyWidthDifference(12),
  },
  buttonContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginVertical: applyWidthDifference(10),
  },
  button: {
    width: applyWidthDifference(300),
  },
});
