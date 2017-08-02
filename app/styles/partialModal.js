import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import relativeDimensions from '../utils/relativeDimensions';

const { applyWidthDifference, fixedResponsiveFontSize } = relativeDimensions;

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
    ...Platform.select({ // OS-specific drop shadow styling
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOpacity: 0.8,
        shadowRadius: 2,
        shadowOffset: {
          height: applyWidthDifference(4),
          width: applyWidthDifference(2),
        },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  topView: {
    marginTop: applyWidthDifference(30),
    marginBottom: applyWidthDifference(20),
  },
  titleText: {
    textAlign: 'center',
    color: '#000000',
    fontSize: fixedResponsiveFontSize(22),
    fontWeight: '500',
    marginTop: applyWidthDifference(10),
    marginHorizontal: applyWidthDifference(12),
  },
  detailText: {
    textAlign: 'center',
    color: '#000000',
    fontSize: fixedResponsiveFontSize(15),
    marginTop: applyWidthDifference(10),
    marginBottom: applyWidthDifference(10),
    marginHorizontal: applyWidthDifference(12),
  },
  buttonContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginTop: applyWidthDifference(10),
    marginBottom: applyWidthDifference(10),
  },
  button: {
    width: applyWidthDifference(300),
  },
});
